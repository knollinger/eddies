package de.eddies.gapscanner;

import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.joda.time.Interval;

/**
 * @author anderl
 *
 */
public class GapFinder
{

    /**
     * @param startDate
     * @param endDate
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Map<Date, List<Interval>> findAllGaps(Date startDate, Date endDate, Connection conn)
        throws SQLException
    {
        Map<String, List<Interval>> plannedIntervals = GapDbUtils.getPlannedIntervals(startDate, endDate, conn);
        Map<Integer, Interval> mandatoryIntervals = GapDbUtils.getMandatoryIntervals(conn);
        Map<String, String> closedDate = GapDbUtils.getClosedDays(startDate, endDate, conn);

        Map<Date, List<Interval>> allGaps = new HashMap<>();
        while (!startDate.after(endDate))
        {
            if (!closedDate.containsKey(startDate.toString()))
            {
                Interval mandatory = mandatoryIntervals.get(GapFinder.getDayOfWeek(startDate));
                if (mandatory != null)
                {
                    List<Interval> gapsPerDay = GapFinder.findGaps(plannedIntervals.get(startDate.toString()),
                        mandatory);
                    if (!gapsPerDay.isEmpty())
                    {
                        allGaps.put(startDate, gapsPerDay);
                    }
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
     * Finds gaps on the time line between a list of existing {@link Interval}
     * and a search {@link Interval}
     * 
     * @param existingIntervals
     * @param searchInterval
     * @return The list of gaps
     */
    public static List<Interval> findGaps(List<Interval> existingIntervals, Interval searchInterval)
    {
        List<Interval> gaps = new ArrayList<Interval>();

        if (existingIntervals == null || existingIntervals.isEmpty())
        {
            gaps.add(searchInterval);
        }
        else
        {
            DateTime searchStart = searchInterval.getStart();
            DateTime searchEnd = searchInterval.getEnd();

            if (hasNoOverlap(existingIntervals, searchInterval, searchStart, searchEnd))
            {
                gaps.add(searchInterval);
                return gaps;
            }

            // create a sub-list that excludes interval which does not overlap with
            // searchInterval
            List<Interval> subExistingList = removeNoneOverlappingIntervals(existingIntervals, searchInterval);
            DateTime subEarliestStart = subExistingList.get(0).getStart();
            DateTime subLatestStop = subExistingList.get(subExistingList.size() - 1).getEnd();

            // in case the searchInterval is wider than the union of the existing
            // include searchInterval.start => earliestExisting.start
            if (searchStart.isBefore(subEarliestStart))
            {
                gaps.add(new Interval(searchStart, subEarliestStart));
            }

            // get all the gaps in the existing list
            gaps.addAll(getExistingIntervalGaps(subExistingList));

            // include latestExisting.stop => searchInterval.stop
            if (searchEnd.isAfter(subLatestStop))
            {
                gaps.add(new Interval(subLatestStop, searchEnd));
            }
        }
        return gaps;
    }

    /**
     * @param existingList
     * @return
     */
    private static List<Interval> getExistingIntervalGaps(List<Interval> existingList)
    {
        List<Interval> gaps = new ArrayList<Interval>();
        Interval current = existingList.get(0);
        for (int i = 1; i < existingList.size(); i++)
        {
            Interval next = existingList.get(i);
            Interval gap = current.gap(next);
            if (gap != null)
                gaps.add(gap);
            current = next;
        }
        return gaps;
    }

    /**
     * @param existingIntervals
     * @param searchInterval
     * @return
     */
    private static List<Interval> removeNoneOverlappingIntervals(List<Interval> existingIntervals,
        Interval searchInterval)
    {
        List<Interval> subExistingList = new ArrayList<Interval>();
        for (Interval interval : existingIntervals)
        {
            if (interval.overlaps(searchInterval))
            {
                subExistingList.add(interval);
            }
        }
        return subExistingList;
    }

    /**
     * @param existingIntervals
     * @param searchInterval
     * @param searchStart
     * @param searchEnd
     * @return
     */
    private static boolean hasNoOverlap(List<Interval> existingIntervals, Interval searchInterval, DateTime searchStart,
        DateTime searchEnd)
    {
        DateTime earliestStart = existingIntervals.get(0).getStart();
        DateTime latestStop = existingIntervals.get(existingIntervals.size() - 1).getEnd();
        // return the entire search interval if it does not overlap with
        // existing at all
        if (searchEnd.isBefore(earliestStart) || searchStart.isAfter(latestStop))
        {
            return true;
        }
        return false;
    }

    /**
     * @param date
     * @return
     */
    private static int getDayOfWeek(Date date)
    {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.setFirstDayOfWeek(Calendar.SUNDAY);
        int dayOfWeek = c.get(Calendar.DAY_OF_WEEK);

        System.out.println(date + ": dayOfWeek: " + dayOfWeek);

        return dayOfWeek - 1;

    }
}
