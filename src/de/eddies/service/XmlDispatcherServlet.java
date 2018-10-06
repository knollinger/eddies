package de.eddies.service;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;

import de.eddies.session.SessionWrapper;


/**
 * Servlet implementation class DispatcherServlet
 */
@SuppressWarnings("serial")
@WebServlet(description = "Dispatched anhand der RequestTypen", urlPatterns = {"/xmlservice"}, loadOnStartup = 1)
public class XmlDispatcherServlet extends HttpServlet
{
    private Map<Class<? extends IJAXBObject>, IXmlServiceHandler> handlers;

    /*-----------------------------------------------------------------------*/
    /**
     * @see HttpServlet#HttpServlet()
     */
    public XmlDispatcherServlet() throws Exception
    {
        this.loadAllHandlers();
    }

    /*-----------------------------------------------------------------------*/
    private void loadAllHandlers()
    {
        this.handlers = new HashMap<Class<? extends IJAXBObject>, IXmlServiceHandler>();
        ServiceLoader<IXmlServiceHandler> loader = ServiceLoader.load(IXmlServiceHandler.class);
        for (IXmlServiceHandler handler : loader)
        {
            Class<? extends IJAXBObject> clazz = handler.getResponsibleFor();
            JAXBSerializer.registerClass(clazz);

            Collection<Class<? extends IJAXBObject>> usedClasses = handler.getUsedJaxbClasses();
            for (Class<? extends IJAXBObject> usedClass : usedClasses)
            {
                JAXBSerializer.registerClass(usedClass);
            }
            this.handlers.put(clazz, handler);
        }
    }

    /*-----------------------------------------------------------------------*/
    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        try
        {
            IJAXBObject reqObj = JAXBSerializer.readObject(request.getInputStream());

            IXmlServiceHandler handler = this.handlers.get(reqObj.getClass());
            if (handler == null)
            {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getOutputStream().write(
                    ("No service handler for '" + reqObj.getClass() + "' found").getBytes());
            }
            else
            {
                IJAXBObject rspObj = null;
                SessionWrapper session = new SessionWrapper(request.getSession());
                if (handler.needSession() && !session.isValid())
                {
                    rspObj = new SessionLostResponse();
                }
                else
                {
                    rspObj = handler.handleRequest(reqObj, session);
                }
                
                if (rspObj != null)
                {
                    response.setHeader("Content-Encoding", "gzip");
                    GZIPOutputStream zipOut = new GZIPOutputStream(response.getOutputStream());
                    JAXBSerializer.writeObject(rspObj, zipOut);
                    zipOut.finish();
                    zipOut.flush();
                }
            }
        }
        catch (JAXBException e)
        {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
