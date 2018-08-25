package de.eddies.gapscanner;


import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;

/**
 * Der {@link CalendarGapScanner} startet einmal pro Nacht und sucht fehlende Theki-Belegungen in den nächsten 7 Tagen.
 * Sollte er solche finden wird ein Mail an alle TeamMitglieder gesendet.
 *
 */
public class CalendarGapScanner implements Runnable
{
    @Override
    public void run()
    {
        Connection conn = null;

        try
        {
            conn = ConnectionPool.getConnection();

            Date startDate = this.calcStartDate();
            Date endDate = this.calcEndDate();

            Map<String, Intervals> plannedIntervals = this.getPlannedIntervals(startDate, endDate, conn);
            Map<Integer, Interval> mandatoryIntervals = this.getMandatoryIntervals(conn);
            Map<Date, Intervals> allGaps = this.findAllGaps(startDate, endDate, plannedIntervals, mandatoryIntervals);
            if (!allGaps.isEmpty())
            {
                MailSender.sendReminder(allGaps, conn);
            }
        }
        catch (SQLException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param startDate
     * @param endDate
     * @param plannedIntervals
     * @param mandatoryIntervals
     * @return
     */
    private Map<Date, Intervals> findAllGaps(Date startDate, Date endDate, Map<String, Intervals> plannedIntervals,
        Map<Integer, Interval> mandatoryIntervals)
    {
        Map<Date, Intervals> allGaps = new HashMap<>();
        while (!startDate.after(endDate))
        {

            Interval mandatory = mandatoryIntervals.get(this.getDayOfWeek(startDate));
            if (mandatory != null)
            {
                Intervals gapsPerDay = this.processOneDay(mandatory, plannedIntervals.get(startDate.toString()));
                if (!gapsPerDay.isEmpty())
                {
                    allGaps.put(startDate, gapsPerDay);
                }
            }
            Calendar c = Calendar.getInstance();
            c.setTime(startDate);
            c.set(Calendar.DATE, c.get(Calendar.DATE) + 1);
            startDate = new Date(c.getTimeInMillis());

        }
        return allGaps;
    }

    /**
     * @param mandatory
     * @param plannedIntervals
     */
    private Intervals processOneDay(Interval mandatory, Intervals plannedIntervals)
    {
        Intervals result = new Intervals();

        // gar nichts geplant?
        if (plannedIntervals == null)
        {
            result.add(mandatory);
        }
        else
        {
            // GAP am Anfang?
            Time minStart = plannedIntervals.getMinStartTime();
            if (mandatory.getStart().before(minStart))
            {
                result.add(new Interval(mandatory.getStart(), minStart));
            }

            // GAP am Ende?
            Time maxEnd = plannedIntervals.getMaxEndTime();
            if (mandatory.getEnd().after(maxEnd))
            {
                result.add(new Interval(maxEnd, mandatory.getEnd()));
            }

            // GAPs in den Geplanten Intervallen?s
            result.addAll(plannedIntervals.getGaps());
        }
        return result;
    }


    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    private Map<String, Intervals> getPlannedIntervals(Date startDate, Date endDate, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Map<String, Intervals> result = new HashMap<>();

            stmt = conn.prepareStatement(
                "select date, begin, end from keeper_termine where date between ? and ? order by date, begin");
            stmt.setDate(1, startDate);
            stmt.setDate(2, endDate);
            rs = stmt.executeQuery();

            Date lastDate = null;
            Intervals intervals = new Intervals();

            while (rs.next())
            {
                Date date = rs.getDate("date");
                Time from = rs.getTime("begin");
                Time until = rs.getTime("end");

                if (lastDate == null || !lastDate.equals(date))
                {
                    lastDate = date;
                    intervals = new Intervals();
                    result.put(date.toString(), intervals);
                }
                intervals.add(new Interval(from, until));
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
    private Map<Integer, Interval> getMandatoryIntervals(Connection conn) throws SQLException
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
                    Interval interval = new Interval(from, until);
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
     * @param date
     * @return
     */
    private int getDayOfWeek(Date date)
    {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.setFirstDayOfWeek(Calendar.SUNDAY);
        int dayOfWeek = c.get(Calendar.DAY_OF_WEEK);

        System.out.println(date + ": dayOfWeek: " + dayOfWeek);

        return dayOfWeek - 1;

    }

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    private Date calcStartDate()
    {
        return new Date(System.currentTimeMillis());
    }

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    private Date calcEndDate()
    {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(System.currentTimeMillis());

        int day = c.get(Calendar.DAY_OF_MONTH);
        day += 7;
        c.set(Calendar.DAY_OF_MONTH, day);

        return new Date(c.getTimeInMillis());
    }
}
