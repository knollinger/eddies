package de.eddies.gapscanner;

import java.sql.Time;

/**
 *
 */
class Interval implements Cloneable
{
    private Time start;
    private Time end;

    /**
     * @param start
     * @param end
     */
    public Interval(Time start, Time end)
    {
        this.start = (start.before(end)) ? start : end;
        this.end = (start.before(end)) ? end : start;
    }

    /**
     * @param mandInt
     */
    public Interval(Interval mandInt)
    {
        this(mandInt.start, mandInt.end);
    }

    /**
     * @return
     */
    public Time getStart()
    {
        return start;
    }

    /**
     *
     */
    public void setStart(Time start)
    {
        this.start = start;
    }

    /**
     * @return
     */
    public Time getEnd()
    {
        return end;
    }

    /**
     * @return
     */
    public void setEnd(Time end)
    {
        this.end = end;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#clone()
     */
    public Interval clone()
    {
        return new Interval(this.start, this.end);
    }

    /* (non-Javadoc)
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString()
    {
        return this.start + "/" + this.end;
    }
}
