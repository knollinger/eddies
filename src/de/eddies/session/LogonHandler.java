package de.eddies.session;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
import de.eddies.role.Role;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;

/**
 * 
 *
 */
public class LogonHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }


    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#roleNeeded()
     */
    @Override
    public Role roleNeeded()
    {
        return Role.ADMIN;
    }
    
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        IJAXBObject result = null;
        
        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request)request;
            
            String uid = req.uid;
            String pwd = req.passwd;
            int memberId = this.verifyUser(uid, pwd, session, conn);
            if (memberId == -1)
            {
                result = new ErrorResponse("Die Benutzerkennung oder das Kennwort sind falsch");
            }
            else
            {
                session.setAccountId(memberId);
                session.setAccountName(uid);
                result = new Response();
            }            
        }
        catch (Exception e)
        {
            new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    /**
     * 
     * @param uid
     * @param pwd
     * @param session
     * @param conn
     * @return
     * @throws Exception
     */
    private int verifyUser(String uid, String pwd, SessionWrapper session, Connection conn) throws Exception
    {
        int memberId = -1;

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select id from user_accounts where accountName = ? and pwdhash = ?");
            stmt.setString(1, uid);
            stmt.setString(2, this.hashPassword(pwd));
            rs = stmt.executeQuery();
            if (rs.next())
            {
                memberId = rs.getInt("id");
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return memberId;
    }

    /**
     * 
     * @param passwd
     * @return
     * @throws NoSuchAlgorithmException
     */
    private String hashPassword(String passwd) throws NoSuchAlgorithmException
    {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.reset();
        byte[] hash = digest.digest(passwd.getBytes());

        StringBuilder result = new StringBuilder();
        for (byte b : hash)
        {
            if (b < 0)
            {
                b += 128;
            }
            result.append(String.format("%1$02x", b));
        }
        return result.toString().toUpperCase();
    }

    /**
     * 
     */
    @XmlRootElement(name = "login-user-request")
    @XmlType(name = "LogonHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "uid")
        public String uid;

        @XmlElement(name = "passwd")
        public String passwd;
    }

    @XmlRootElement(name = "login-user-ok-response")
    @XmlType(name = "LogonHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
