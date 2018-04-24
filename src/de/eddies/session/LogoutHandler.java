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
public class LogoutHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return true;
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
        result.add(Response.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        session.invalidate();
        return new Response();
    }

    /**
     *
     */
    @XmlRootElement(name = "logout-request")
    @XmlType(name="LogoutHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
    *
    */
    @XmlRootElement(name = "logout-response")
    @XmlType(name="LogoutHandler.Response")
    public static class Response implements IJAXBObject
    {

    }
}
