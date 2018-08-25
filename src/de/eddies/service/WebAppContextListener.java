package de.eddies.service;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import de.eddies.database.ConnectionPool;
import de.eddies.gapscanner.CalendarGapScanner;

/**
 * Application Lifecycle Listener implementation class WebAppContextListener
 *
 */
@WebListener
public class WebAppContextListener implements ServletContextListener
{
    /**
     * @see ServletContextListener#contextInitialized(ServletContextEvent)
     */
    public void contextInitialized(ServletContextEvent arg0)
    {
        try
        {
            ConnectionPool.init();
            ThreadPool.getInstance().startup();
            ThreadPool.getInstance().submit(new CalendarGapScanner());
        }
        catch (Exception e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    /**
     * @see ServletContextListener#contextDestroyed(ServletContextEvent)
     */
    public void contextDestroyed(ServletContextEvent arg0)
    {
        ThreadPool.getInstance().shutdown();
    }
}
