package de.eddies.gapscanner;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.joda.time.Interval;

import de.eddies.database.DBUtils;

/**
 * @author anderl
 *
 */
public class GapDbUtils
{

    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Map<String, List<Interval>> getPlannedIntervals(Date startDate, Date endDate, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Map<String, List<Interval>> result = new HashMap<>();

            stmt = conn.prepareStatement(
                "select date, begin, end from keeper_termine where date between ? and ? order by date, begin, end");
            stmt.setDate(1, startDate);
            stmt.setDate(2, endDate);
            rs = stmt.executeQuery();

            Date lastDate = null;
            List<Interval> intervals = new ArrayList<>();

            while (rs.next())
            {
                Date date = rs.getDate("date");
                Time from = rs.getTime("begin");
                Time until = rs.getTime("end");

                if (lastDate == null || !lastDate.equals(date))
                {
                    lastDate = date;
                    intervals = new ArrayList<>();
                    result.put(date.toString(), intervals);
                }
                intervals.add(new Interval(from.getTime(), until.getTime()));
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
    public static Map<Integer, Interval> getMandatoryIntervals(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select * from opening_hours");
            rs = stmt.executeQuery();
            Map<Integer, Interval> result = new HashMap<>();

            while (rs.next())
            {
                Integer dayOfWeek = Integer.valueOf(rs.getInt("day_of_week"));
                Time from = rs.getTime("from");
                Time until = rs.getTime("until");
                if (until != null && from != null)
                {
                    Interval interval = new Interval(from.getTime(), until.getTime());
                    result.put(dayOfWeek, interval);
                }
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
     * @param startDate
     * @param endDate
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Map<String, String> getClosedDays(Date startDate, Date endDate, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select date, text from notes where date between ? and ? and closed=?");
            stmt.setDate(1, startDate);
            stmt.setDate(2, endDate);
            stmt.setString(3, "true");
            rs = stmt.executeQuery();
            Map<String, String> result = new HashMap<>();

            while (rs.next())
            {
                String date = rs.getDate("date").toString();
                String text = rs.getString("text");
                result.put(date, text.trim());
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
