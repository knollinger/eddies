package de.eddies.member;

import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.database.ConnectionPool;
import de.eddies.service.IGetDocServiceHandler;
import de.eddies.session.SessionWrapper;

/**
 * Ein {@link IGetDocServiceHandler}, welcher Attachments aus der 
 * Datenbank liefert
 * 
 */
public class GetMemberImageHandler implements IGetDocServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "memberImage";
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session)
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            int memberId = this.extractMemberId(req);

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select sex, image, image_type from accounts where id=?");
            stmt.setInt(1, memberId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                String mimeType = rs.getString("image_type");
                Blob blob = rs.getBlob("image");
                if (mimeType != null && blob != null)
                {
                    byte[] content = blob.getBytes(1, (int) blob.length());

                    rsp.setStatus(HttpServletResponse.SC_OK);
                    rsp.setContentType(mimeType);
                    rsp.setContentLength(content.length);
                    OutputStream out = rsp.getOutputStream();
                    out.write(content);
                }
                else
                {
                    ESex sex = ESex.valueOf(rs.getString("sex"));
                    this.sendDefaultImage(rsp, sex);
                }
            }
            else
            {
                this.sendDefaultImage(rsp, ESex.U);
            }
        }
        catch (Exception e)
        {
            rsp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param req
     * @return
     */
    private int extractMemberId(HttpServletRequest req)
    {
        int id = -1;

        try
        {
            id = Integer.parseInt(req.getParameter("id"));
        }
        catch (Exception e)
        {

        }
        return id;
    }

    /**
    * @param domain
    * @param sex
    * @param rsp
    */
    private void sendDefaultImage(HttpServletResponse rsp, ESex sex)
    {
        String img;
        switch (sex)
        {
            case F :
                img = "/eddies/gui/images/avatar-female.svg";
                break;

            case M :
                img = "/eddies/gui/images/avatar-male.svg";
                break;

            default :
                img = "/eddies/gui/images/avatar-undef-sex.svg";
                break;

        }
        rsp.setHeader("Location", img);
        rsp.setStatus(HttpServletResponse.SC_FOUND);
    }
}
