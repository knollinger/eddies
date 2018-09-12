package de.eddies.admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import de.eddies.database.DBUtils;
import de.eddies.service.EAction;

/**
 *
 */
public class AdminDBUtils
{

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static OpeningHoursModel getOpeningHoursModel(Connection conn) throws SQLException
    {
        OpeningHoursModel result = new OpeningHoursModel();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from opening_hours");
            rs = stmt.executeQuery();
            while (rs.next())
            {

                OpeningHoursModel.Entry e = new OpeningHoursModel.Entry();
                e.action = EAction.NONE;
                e.dayOfWeek = rs.getInt("day_of_week");
                e.from = rs.getTime("from");
                e.until = rs.getTime("until");
                result.entries.add(e);
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
     * @return
     * @throws SQLException 
     */
    public static void saveOpeningHoursModel(OpeningHoursModel model, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update `opening_hours` set `from`=?, `until`=? where `day_of_week`=?");
            
            for (OpeningHoursModel.Entry entry : model.entries)
            {
                stmt.setTime(1, entry.from);
                stmt.setTime(2, entry.until);
                stmt.setInt(3, entry.dayOfWeek);
                stmt.executeUpdate();
            }
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
