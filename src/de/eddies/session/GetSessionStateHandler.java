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
 * @author anderl
 *
 */
public class GetSessionStateHandler implements IXmlServiceHandler
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

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(LoggedInResponse.class);
        result.add(LoggedOutResponse.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject response = null;
        if (!session.isValid())
        {
            response = new LoggedOutResponse();
        }
        else
        {
            response = this.getAccountInformation(session.getAccountId());
        }
        return response;
    }

    /**
     * @param accountId
     * @return
     */
    private IJAXBObject getAccountInformation(Integer accountId)
    {
        IJAXBObject rsp = null;

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select * from accounts where id=?");
            stmt.setInt(1, accountId);
            rs = stmt.executeQuery();
            if (!rs.next())
            {
                rsp = new ErrorResponse("Die angegebene Benutzerkennung ist nicht bekannt");
            }
            else
            {
                LoggedInResponse response = new LoggedInResponse();
                response.id = rs.getInt("id");
                response.zname = rs.getString("zname");
                response.vname = rs.getString("vname");
                response.mobile = rs.getString("mobile");
                response.phone = rs.getString("phone");
                response.email = rs.getString("email");
                response.role = ERole.valueOf(rs.getString("role"));
                rsp = response;
            }
        }
        catch (Exception e)
        {
            rsp = new ErrorResponse("");
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
    @XmlRootElement(name = "get-session-state-request")
    @XmlType(name = "GetSessionStateHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
    *
    */
    @XmlRootElement(name = "get-session-state-loggedin-response")
    @XmlType(name = "GetSessionStateHandler.LoggedInResponse")
    public static class LoggedInResponse implements IJAXBObject
    {
        @XmlElement(name = "id")
        public Integer id;

        @XmlElement(name = "zname")
        public String zname;

        @XmlElement(name = "vname")
        public String vname;

        @XmlElement(name = "phone")
        public String phone;

        @XmlElement(name = "mobile")
        public String mobile;

        @XmlElement(name = "email")
        public String email;

        @XmlElement(name = "role")
        public ERole role;
    }

    /**
    *
    */
    @XmlRootElement(name = "get-session-state-loggedout-response")
    @XmlType(name = "GetSessionStateHandler.LoggedOutResponse")
    public static class LoggedOutResponse implements IJAXBObject
    {

    }
}
