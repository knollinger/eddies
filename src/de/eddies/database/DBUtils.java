package de.eddies.database;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 
 *
 */
public class DBUtils
{
    /**
     * @param conn
     */
    public static void closeQuitly(Connection conn)
    {
        if (conn != null)
        {
            try
            {
                conn.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }

    /**
     * @param stmt
     */
    public static void closeQuitly(Statement stmt)
    {
        if (stmt != null)
        {
            try
            {
                stmt.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }

    /**
     * @param rs
     */
    public static void closeQuitly(ResultSet rs)
    {
        if (rs != null)
        {
            try
            {
                rs.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }
}
