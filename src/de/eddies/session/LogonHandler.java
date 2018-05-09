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
public class LogonHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return false;
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

            String email = req.email.toLowerCase();
            String pwd = PasswordUtil.hashPassword(req.password);

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select id from accounts where email=? and pwdhash=?");
            stmt.setString(1, email);
            stmt.setString(2, pwd);
            rs = stmt.executeQuery();
            if (!rs.next())
            {
                rsp = new ErrorResponse("Die angegebene Email oder das Kennwort sind falsch");
            }
            else
            {
                session.setAccountId(rs.getInt("id"));
                rsp = new Response();      
            }
        }
        catch (Exception e)
        {
            rsp = new ErrorResponse("WTF");
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
    @XmlRootElement(name = "logon-request")
    @XmlType(name = "LogonHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "email")
        public String email;

        @XmlElement(name = "password")
        public String password;
    }

    /**
    *
    */
    @XmlRootElement(name = "logon-response")
    @XmlType(name = "LogonHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
