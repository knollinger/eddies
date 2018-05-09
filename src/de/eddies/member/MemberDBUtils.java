package de.eddies.member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import de.eddies.database.DBUtils;

public class MemberDBUtils
{
    /**
     * @param id
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Member getMemberById(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Member result = null;

            stmt = conn.prepareStatement("select * from accounts where id=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                result = new Member();
                result.id = rs.getInt("id");
                result.zname = rs.getString("zname");
                result.vname = rs.getString("vname");
                result.phone = rs.getString("phone");
                result.mobile = rs.getString("mobile");
                result.email = rs.getString("email");
                result.sex = ESex.valueOf(rs.getString("sex"));
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

            stmt = conn.prepareStatement("select id, zname, vname, phone, mobile, email, sex from accounts");
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
}
