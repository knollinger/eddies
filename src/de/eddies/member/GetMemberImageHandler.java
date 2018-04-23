package de.eddies.member;

import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.attachments.EAttachmentDomain;
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
            EAttachmentDomain domain = EAttachmentDomain.valueOf(req.getParameter("domain"));

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select mimetype, file from attachments where ref_id=? and domain=?");
            stmt.setInt(1, memberId);
            stmt.setString(2, domain.name());
            rs = stmt.executeQuery();
            if (rs.next())
            {

                String mimeType = rs.getString("mimetype");
                Blob blob = rs.getBlob("file");
                byte[] content = blob.getBytes(1, (int) blob.length());

                rsp.setStatus(HttpServletResponse.SC_OK);
                rsp.setContentType(mimeType);
                rsp.setContentLength(content.length);
                OutputStream out = rsp.getOutputStream();
                out.write(content);
            }
            else
            {
                this.tryDefaultImage(domain, rsp);
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
    private void tryDefaultImage(EAttachmentDomain domain, HttpServletResponse rsp)
    {
        switch (domain)
        {
            case THUMBNAIL :
                this.getDefaultThumbNail(rsp);
                break;

            case MAILSIG :
                rsp.setHeader("Location", "../images/mail_signature_128x128.png");
                rsp.setStatus(HttpServletResponse.SC_FOUND);
                break;

            default :
                rsp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                break;
        }
    }

    /**
     * @param sex
     * @param rsp
     */
    private void getDefaultThumbNail(HttpServletResponse rsp)
    {
        rsp.setHeader("Location", "../gui/images/avatar.svg");
        rsp.setContentType("image/svg");
        rsp.setStatus(HttpServletResponse.SC_FOUND);
    }
}
