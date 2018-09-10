package de.eddies.gapscanner;


import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.joda.time.Interval;

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

            Map<Date, List<Interval>> allGaps = GapFinder.findAllGaps(startDate, endDate, conn);
            System.out.println(allGaps);
            if (!allGaps.isEmpty())
            {
                MailSender.sendReminder(allGaps, conn);
            }
        }
        catch (Exception e)
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
