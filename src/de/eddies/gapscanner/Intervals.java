package de.eddies.gapscanner;

import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

/**
 * @author anderl
 *
 */
class Intervals
{
    private List<Interval> intervals = new ArrayList<>();

    /**
     * @return
     */
    public List<Interval> getIntervals()
    {
        return intervals;
    }

    /**
     * @param intervals
     */
    public void setIntervals(List<Interval> intervals)
    {
        this.intervals = intervals;
    }

    /**
     * @param interval
     */
    public void add(Interval interval)
    {
        this.intervals.add(interval);

    }

    /**
     * @param intervals
     */
    public void addAll(Intervals intervals)
    {
        this.intervals.addAll(intervals.getIntervals());
    }

    /**
     * @return
     */
    public boolean isEmpty()
    {
        return this.intervals.isEmpty();
    }

    /**
     * @return <code>null</code> fall keine Intervalle vorhanden sind, 
     * sonst die kleinste StartZeit
     */
    public Time getMinStartTime()
    {
        Time result = null;

        if (!this.intervals.isEmpty())
        {
            result = this.intervals.get(0).getStart();
            for (Interval i : intervals)
            {
                Time curr = i.getStart();
                if(curr.before(result)) {
                    result = curr;
                }
            }
        }

        return result;

    }
    
    /**
     * @return <code>null</code> fall keine Intervalle vorhanden sind, 
     * sonst die größte EndZeit
     */
    public Time getMaxEndTime()
    {
        Time result = null;

        if (!this.intervals.isEmpty())
        {
            result = this.intervals.get(0).getEnd();
            for (Interval i : intervals)
            {
                Time curr = i.getEnd();
                if(curr.after(result)) {
                    result = curr;
                }
            }
        }
        return result;
    }

    /**
     * @return
     */
    public Intervals getGaps()
    {
        // TODO Auto-generated method stub
        return new Intervals();
    }
    
    
    /* (non-Javadoc)
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        
        return this.intervals.toString();
    }
    
}
