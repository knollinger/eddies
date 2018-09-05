package de.eddies.service;

import java.lang.Thread.UncaughtExceptionHandler;
import java.util.concurrent.ThreadFactory;

/**
 * @author anderl
 *
 */
class DaemonThreadFactory implements ThreadFactory
{

    private static UncaughtExceptionHandler uncaughtHandler = new MyUncaughtExceptionHandler();
    @Override
    public Thread newThread(Runnable r)
    {
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.setUncaughtExceptionHandler(uncaughtHandler);
        return t;
    }
    
    /**
     * @author anderl
     *
     */
    static class MyUncaughtExceptionHandler implements UncaughtExceptionHandler
    {

        @Override
        public void uncaughtException(Thread arg0, Throwable arg1)
        {
            // TODO Auto-generated method stub

        }
    }

}