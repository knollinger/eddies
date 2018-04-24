package de.eddies.session;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;

/**
 * @author anderl
 *
 */
public class GetSessionStateHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(LoggedInResponse.class);
        result.add(LoggedOutResponse.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        return session.isValid() ? new LoggedInResponse() : new LoggedOutResponse();
    }

    /**
     *
     */
    @XmlRootElement(name = "get-session-state-request")
    @XmlType(name="GetSessionStateHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
    *
    */
    @XmlRootElement(name = "get-session-state-loggedin-response")
    @XmlType(name="GetSessionStateHandler.LoggedInResponse")
    public static class LoggedInResponse implements IJAXBObject
    {

    }

    /**
    *
    */
    @XmlRootElement(name = "get-session-state-loggedout-response")
    @XmlType(name="GetSessionStateHandler.LoggedOutResponse")
    public static class LoggedOutResponse implements IJAXBObject
    {

    }
}
