package de.eddies.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @author anderl
 *
 */
class MidnightScheduler
{
    private static final MidnightScheduler INSTANCE = new MidnightScheduler();
    private ScheduledExecutorService executor;

    /**
     * 
     */
    private MidnightScheduler()
    {
    }

    /**
     * @return
     */
    public static MidnightScheduler getInstance()
    {
        return MidnightScheduler.INSTANCE;
    }

    /**
     * @param r
     */
    public void schedule(Runnable r)
    {
        if (this.executor != null)
        {
            Long midnight = LocalDateTime.now().until(LocalDate.now().plusDays(1).atStartOfDay(), ChronoUnit.MINUTES);
            this.executor.scheduleAtFixedRate(r, midnight, 1440, TimeUnit.MINUTES);
        }
    }

    /**
     * 
     */
    public void startup()
    {
        if (this.executor == null)
        {
            this.executor = Executors.newScheduledThreadPool(1);
        }
    }

    /**
     * 
     */
    public void shutdown()
    {
        if (this.executor != null)
        {
            this.executor.shutdownNow();
        }
    }
}
