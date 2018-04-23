package de.eddies.member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.role.Role;
import de.eddies.service.EAction;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;
import de.eddies.session.SessionWrapper;

/**
 * 
 * Speichert das Update an einem Member oder legt einen neuen an
 *
 */
public class SaveMemberHandler implements IXmlServiceHandler
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
        return Member.class;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Member.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#handleRequest(de.eddies.service.IJAXBObject, de.eddies.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;
        Connection conn = null;

        try
        {
            Member member = (Member) request;
            conn = ConnectionPool.getConnection();
            switch (member.action)
            {
                case CREATE :
                    result = this.createMember(member, conn);
                    break;

                case MODIFY :
                    result = this.updateMember(member, conn);
                    break;

                default :
                    break;
            }
            member.action = EAction.NONE;
            return result;
        }
        catch (SQLException e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    /**
     * 
     * @param member
     * @param conn
     */
    private Member createMember(Member member, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into members set zname=?, vname=?, vname2=?, title=?, phone=?, mobile=?, email=?");
            stmt.setString(1, member.zname);
            stmt.setString(2, member.vname);
            stmt.setString(3, member.vname2);
            stmt.setString(4, member.title);
            stmt.setString(5, member.phone);
            stmt.setString(6, member.mobile);
            stmt.setString(7, member.email);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            member.id = rs.getInt(1);
            return member;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param member
     * @param conn
     * @throws SQLException 
     */
    private Member updateMember(Member member, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("update members set zname=?, vname=?, vname2=?, title=?, phone=?, mobile=?, email=? where id=?");
            stmt.setString(1, member.zname);
            stmt.setString(2, member.vname);
            stmt.setString(3, member.vname2);
            stmt.setString(4, member.title);
            stmt.setString(5, member.phone);
            stmt.setString(6, member.mobile);
            stmt.setString(7, member.email);
            stmt.setInt(8, member.id);
            stmt.executeUpdate();
            return member;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
