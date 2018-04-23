package de.eddies.session;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.role.Role;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;

/**
 * 
 *
 */
public class LogoutHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }


    @Override
    public Role roleNeeded()
    {
        return Role.ADMIN;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
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
    @XmlType(name = "LogoutHandler.Request")
    public static class Request implements IJAXBObject
    {
    }

    @XmlRootElement(name = "logout-ok-response")
    @XmlType(name = "LogoutHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
