package de.eddies.member;

import java.io.ByteArrayInputStream;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import de.eddies.database.DBUtils;
import de.eddies.session.PasswordUtil;

public class MemberDBUtils
{
//    /**
//     * @param id
//     * @param conn
//     * @return
//     * @throws SQLException 
//     */
//    public static Member getMemberById(int id, Connection conn) throws SQLException
//    {
//        PreparedStatement stmt = null;
//        ResultSet rs = null;
//        try
//        {
//            Member result = null;
//
//            stmt = conn.prepareStatement("select * from accounts where id=?");
//            stmt.setInt(1, id);
//            rs = stmt.executeQuery();
//            if (rs.next())
//            {
//                result = new Member();
//                result.id = rs.getInt("id");
//                result.zname = rs.getString("zname");
//                result.vname = rs.getString("vname");
//                result.phone = rs.getString("phone");
//                result.mobile = rs.getString("mobile");
//                result.email = rs.getString("email");
//                result.sex = ESex.valueOf(rs.getString("sex"));
//            }
//            return result;
//        }
//        finally
//        {
//            DBUtils.closeQuitly(rs);
//            DBUtils.closeQuitly(stmt);
//        }
//    }
//
    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static List<Member> getAllMembers(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            List<Member> result = new ArrayList<>();

            stmt = conn.prepareStatement("select id, zname, vname, phone, mobile, email, sex, role from accounts");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Member m = new Member();
                m.id = rs.getInt("id");
                m.zname = rs.getString("zname");
                m.vname = rs.getString("vname");
                m.phone = rs.getString("phone");
                m.mobile = rs.getString("mobile");
                m.email = rs.getString("email");
                m.sex = ESex.valueOf(rs.getString("sex"));
                m.role = ERole.valueOf(rs.getString("role"));
                result.add(m);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param model
     * @param conn
     * @throws SQLException 
     */
    public static void saveAllMembers(MembersModel model, Connection conn) throws SQLException
    {
        for (Member m : model.members)
        {
            switch (m.action)
            {
                case CREATE :
                    MemberDBUtils.createMember(m, conn);
                    break;

                case MODIFY :
                    MemberDBUtils.updateMember(m, conn);
                    break;

                case REMOVE :
                    MemberDBUtils.removeMember(m.id, conn);

                case NONE :
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param m
     * @param conn
     * @throws SQLException 
     * @throws NoSuchAlgorithmException 
     */
    private static void createMember(Member m, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into accounts set zname=?, vname=?, mobile=?, phone=?, email=?, sex=?, role=?, pwdhash=?");
            stmt.setString(1, m.zname.trim());
            stmt.setString(2, m.vname.trim());
            stmt.setString(3, m.mobile.trim());
            stmt.setString(4, m.phone.trim());
            stmt.setString(5, m.email.trim());
            stmt.setString(6, m.sex.name());
            stmt.setString(7, m.role.name());
            stmt.setString(8, PasswordUtil.hashPassword(m.email));
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            m.id = rs.getInt(1);
            MemberDBUtils.tryToUpdateMemberImage(m, conn);
        }
        catch (NoSuchAlgorithmException e)
        {
            throw new SQLException(e);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param m
     * @param conn
     * @throws SQLException 
     */
    private static void updateMember(Member m, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update accounts set zname=?, vname=?, mobile=?, phone=?, email=?, sex=?, role=? where id=?");
            stmt.setString(1, m.zname.trim());
            stmt.setString(2, m.vname.trim());
            stmt.setString(3, m.mobile.trim());
            stmt.setString(4, m.phone.trim());
            stmt.setString(5, m.email.trim());
            stmt.setString(6, m.sex.name());
            stmt.setString(7, m.role.name());
            stmt.setInt(8, m.id);
            stmt.executeUpdate();
            MemberDBUtils.tryToUpdateMemberImage(m, conn);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param m
     * @param conn
     * @throws SQLException 
     */
    private static void tryToUpdateMemberImage(Member m, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update accounts set image=?, image_type=? where id=?");
            if (m.imgData != null && m.imgData.length != 0 && m.imgType != null && m.imgType.length() != 0)
            {
                stmt.setBlob(1, new ByteArrayInputStream(m.imgData));
                stmt.setString(2, m.imgType);
                stmt.setInt(3, m.id);
                stmt.executeUpdate();
            }
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param id
     * @param conn
     */
    private static void removeMember(int id, Connection conn)
    {
        // TODO: geht erst, wenn die Purifier-Table von der CalEntryTable getrennt ist
    }
}
