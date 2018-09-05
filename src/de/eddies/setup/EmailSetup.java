package de.eddies.setup;

import javax.xml.bind.annotation.XmlElement;

/**
 * 
 *
 */
public class EmailSetup
{
    @XmlElement(name = "is-mail-enabled")
    public boolean isMailEnabled = false;

    @XmlElement(name = "receive")
    public ConnectionDesc receive;

    @XmlElement(name = "send")
    public SendConnectionDesc send;


    /**
     *
     */
    public static class ConnectionDesc
    {

        @XmlElement(name = "host")
        public String host;

        @XmlElement(name = "port")
        public Integer port;

        @XmlElement(name = "user")
        public String user;

        @XmlElement(name = "pwd")
        public String passwd;

        @XmlElement(name = "use-start-tls")
        public boolean useStartTLS;

        @XmlElement(name = "protocol")
        public String protocol;
    }

    /**
     * @author anderl
     *
     */
    public static class SendConnectionDesc extends ConnectionDesc
    {

        @XmlElement(name = "from")
        public String from;
    }
}
