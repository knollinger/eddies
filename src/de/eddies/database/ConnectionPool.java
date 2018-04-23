package de.eddies.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.xml.bind.JAXBException;

import de.eddies.setup.DbSetup;
import de.eddies.setup.SetupReader;

/**
 * 
 *
 */
public class ConnectionPool
{
    private static final String MYSQL_URL_TEMPLATE = "jdbc:mysql://%1$s:%2$d/%3$s?user=%4$s&password=%5$s";
    private static String DB_HOST = null;
    private static Integer DB_PORT = null;
    private static String DB_NAME = null;
    private static String DB_USER = null;
    private static String DB_PASSWD = null;
    private static boolean isInitialized = false;

    /**
     * @throws ClassNotFoundException 
     * @throws JAXBException 
     */
    public static void init()
        throws ClassNotFoundException, JAXBException
    {
        if (!ConnectionPool.isInitialized)
        {
            Class.forName("com.mysql.jdbc.Driver");
            DbSetup setup = SetupReader.getSetup().getDbSetup();
            
            ConnectionPool.DB_HOST = setup.getHost();
            ConnectionPool.DB_PORT = setup.getPort();
            ConnectionPool.DB_NAME = setup.getDbName();
            ConnectionPool.DB_USER = setup.getDbUser();
            ConnectionPool.DB_PASSWD = setup.getDbPwd();
            ConnectionPool.isInitialized = true;
        }
    }

    /**
     * 
     */
    private static void ensureIsInitialized()
    {
        if (!ConnectionPool.isInitialized)
        {
            throw new IllegalStateException(
                "ConnectionPool is not initialized, use 'ConnectionPool.initialize()' before!");
        }
    }

    /**
     * @return
     * @throws SQLException 
     */
    public static Connection getConnection() throws SQLException
    {
        ConnectionPool.ensureIsInitialized();
        String url = String.format(MYSQL_URL_TEMPLATE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWD);
        return DriverManager.getConnection(url);
    }
}
