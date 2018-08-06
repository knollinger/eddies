package de.eddies.session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;

/**
 *
 */
public class ChangePWDHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#handleRequest(de.eddies.service.IJAXBObject, de.eddies.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject rsp = null;

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Request req = (Request) request;

            String email = session.getEmail();
            String oldPwd = PasswordUtil.hashPassword(req.oldPWD);
            String newPwd = PasswordUtil.hashPassword(req.newPWD);

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("update accounts set pwdhash=? where email=? and pwdhash=?");
            stmt.setString(1, newPwd);
            stmt.setString(2, email);
            stmt.setString(3, oldPwd);
            int count = stmt.executeUpdate();
            if (count == 0)
            {
                rsp = new ErrorResponse("Die angegebene Email oder das Kennwort sind falsch");
            }
            else
            {
                rsp = new Response();      
            }
        }
        catch (Exception e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    /**
     *
     */
    @XmlRootElement(name = "changepwd-request")
    @XmlType(name = "ChangePWDHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "old-passwd")
        public String oldPWD;

        @XmlElement(name = "new-passwd")
        public String newPWD;
    }

    /**
    *
    */
    @XmlRootElement(name = "changepwd-ok-response")
    @XmlType(name = "ChangePWDHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
