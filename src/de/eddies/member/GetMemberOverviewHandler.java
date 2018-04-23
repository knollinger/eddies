package de.eddies.member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.role.Role;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;
import de.eddies.session.SessionWrapper;

/**
 * @author anderl
 *
 */
public class GetMemberOverviewHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#roleNeeded()
     */
    @Override
    public Role roleNeeded()
    {
        return Role.ADMIN;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
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
            Response response = new Response();
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select * from members order by zname");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Member m = new Member();
                m.id = rs.getInt("id");
                m.zname = DBUtils.getStringFromResultOrDefault(rs, "zname", "");
                m.vname = DBUtils.getStringFromResultOrDefault(rs, "vname", "");
                m.vname2 = DBUtils.getStringFromResultOrDefault(rs, "vname2", "");
                m.title = DBUtils.getStringFromResultOrDefault(rs, "title", "");
                m.phone = DBUtils.getStringFromResultOrDefault(rs, "phone", "");
                m.mobile = DBUtils.getStringFromResultOrDefault(rs, "mobile", "");
                m.email = DBUtils.getStringFromResultOrDefault(rs, "email", "");
                response.members.add(m);
            }
            rsp = response;
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

    @XmlRootElement(name = "get-member-overview-req")
    public static class Request implements IJAXBObject
    {

    }

    @XmlRootElement(name = "get-member-overview-ok-rsp")
    public static class Response implements IJAXBObject
    {
        @XmlElementWrapper(name = "members")
        @XmlElement(name = "member")
        public Collection<Member> members = new ArrayList<>();
    }
}
