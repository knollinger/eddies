package de.eddies.member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

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
