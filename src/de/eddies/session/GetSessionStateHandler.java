package de.eddies.session;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.role.Role;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;

public class GetSessionStateHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#roleNeeded()
     */
    @Override
    public Role roleNeeded()
    {
        return Role.GUEST;
    }
    
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(LoggedInResponse.class);
        result.add(LoggedOutResponse.class);
        result.add(SessionLostResponse.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result;
        if (session.isValid())
        {
            LoggedInResponse loggedInRsp= new LoggedInResponse();
            loggedInRsp.id = session.getAccountId();
            loggedInRsp.name = session.getAccountName();
            result = loggedInRsp;
        }
        else
        {
            result = new LoggedOutResponse();
        }
        return result;
    }

    @XmlRootElement(name = "get-session-state-request")
    @XmlType(name = "GetSessionStateHandler.Request")
    public static class Request implements IJAXBObject
    {
    }

    @XmlRootElement(name = "get-session-state-loggedin-response")
    @XmlType(name = "GetSessionStateHandler.LoggedInResponse")
    public static class LoggedInResponse implements IJAXBObject
    {
        @XmlElement(name = "user-id")
        public int id;

        @XmlElement(name = "user-name")
        public String name;

        @XmlElement(name = "user-image")
        public String getUserImage()
        {

            return "getDocument/memberImage?id=" + this.id + "&domain=THUMBNAIL";
        }

        public void setUserImage()
        {
            // nothing to do...will be calculated from id
        }
    }

    @XmlRootElement(name = "get-session-state-loggedout-response")
    @XmlType(name = "GetSessionStateHandler.LoggedOutResponse")
    public static class LoggedOutResponse implements IJAXBObject
    {
    }
}
