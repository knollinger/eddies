package de.eddies.setup;

import javax.xml.bind.annotation.XmlElement;

/*---------------------------------------------------------------------------*/
/**
 * 
 *
 */
public class DbSetup
{
    private String host;
    private Integer port;
    private String dbName;
    private String dbUser;
    private String dbPwd;

    /*-----------------------------------------------------------------------*/
    /**
     * 
     */
    public DbSetup()
    {
    }

    /*-----------------------------------------------------------------------*/
    @XmlElement(name="host")
    public String getHost()
    {
        return host;
    }

    /*-----------------------------------------------------------------------*/
    public void setHost(String host)
    {
        this.host = host;
    }

    /*-----------------------------------------------------------------------*/
    @XmlElement(name="port")
    public Integer getPort()
    {
        return port;
    }

    /*-----------------------------------------------------------------------*/
    public void setPort(Integer port)
    {
        this.port = port;
    }

    /*-----------------------------------------------------------------------*/
    @XmlElement(name="dbname")
    public String getDbName()
    {
        return dbName;
    }

    /*-----------------------------------------------------------------------*/
    public void setDbName(String dbName)
    {
        this.dbName = dbName;
    }

    /*-----------------------------------------------------------------------*/
    @XmlElement(name="user")
    public String getDbUser()
    {
        return dbUser;
    }

    /*-----------------------------------------------------------------------*/
    public void setDbUser(String dbUser)
    {
        this.dbUser = dbUser;
    }

    /*-----------------------------------------------------------------------*/
    @XmlElement(name="pwd")
    public String getDbPwd()
    {
        return dbPwd;
    }

    /*-----------------------------------------------------------------------*/
    public void setDbPwd(String dbPwd)
    {
        this.dbPwd = dbPwd;
    }
}
