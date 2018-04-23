package de.eddies.session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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

public class GetAllAccountsHandler implements IXmlServiceHandler
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
        return Role.GUEST;
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
        Collection<Class<? extends IJAXBObject>> classes = new ArrayList<Class<? extends IJAXBObject>>();
        classes.add(Request.class);
        classes.add(Response.class);
        return classes;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.SessionWrapper)
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
            Response accounts = new Response();
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select id, accountName from user_accounts order by accountName");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                AccountInfo ai = new AccountInfo();
                ai.id = rs.getInt("id");
                ai.accountName = rs.getString("accountName");
                accounts.accounts.add(ai);
            }
            rsp = accounts;
        }
        catch (SQLException e)
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
    @XmlRootElement(name = "get-login-accounts-request")
    @XmlType(name = "get-login-accounts-request")
    public static class Request implements IJAXBObject
    {

    }

    public static class AccountInfo
    {
        @XmlElement(name = "id")
        public int id;

        @XmlElement(name = "name")
        public String accountName;
    }

    @XmlRootElement(name = "get-login-accounts-ok-response")
    @XmlType(name = "get-login-accounts-ok-response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "account")
        Collection<AccountInfo> accounts = new ArrayList<AccountInfo>();
    }
}
