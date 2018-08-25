package de.eddies.service;

import java.lang.Thread.UncaughtExceptionHandler;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * 
 * @author anderl
 *
 */
public class ThreadPool
{

    private static ThreadPool INSTANCE = new ThreadPool();

    private ExecutorService exec = null;

    /**
     * 
     */
    private ThreadPool()
    {

    }

    /**
     * @return
     */
    public static ThreadPool getInstance()
    {
        return ThreadPool.INSTANCE;
    }

    /**
     * 
     */
    public void startup()
    {
        if (this.exec == null)
        {
            int coreSize = Runtime.getRuntime().availableProcessors();
            int maxSize = coreSize * 2;
            int keepAlive = 60;
            BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
            ThreadFactory factory = new DaemonFactory();
            RejectedExecutionHandler rejectedHandler = new ThreadPoolExecutor.CallerRunsPolicy();
            this.exec = new ThreadPoolExecutor(coreSize, maxSize, keepAlive, TimeUnit.SECONDS, queue, factory,
                rejectedHandler);

        }
    }

    /**
     * 
     */
    public void shutdown()
    {
        if (this.exec != null)
        {
            try
            {
                this.exec.shutdown();
                this.exec.awaitTermination(60, TimeUnit.SECONDS);
            }
            catch (InterruptedException e)
            {
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * @param r
     */
    public void submit(Runnable r)
    {
        if (this.exec == null)
        {
            throw new IllegalStateException("ThreadPool not started.");
        }
        this.exec.submit(r);
    }

    /**
     * @author anderl
     *
     */
    private static class DaemonFactory implements ThreadFactory
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
    }

    /**
     * @author anderl
     *
     */
    private static class MyUncaughtExceptionHandler implements UncaughtExceptionHandler
    {

        @Override
        public void uncaughtException(Thread arg0, Throwable arg1)
        {
            // TODO Auto-generated method stub

        }
    }
}
