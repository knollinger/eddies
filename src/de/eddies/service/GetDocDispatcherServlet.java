package de.eddies.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.ServiceLoader;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.session.SessionWrapper;

/*---------------------------------------------------------------------------*/
/**
 * Ein Servlet, welches die unterschiedlichen getDocument/* Requests an die
 * diversen Handler verteilt.
 */
@SuppressWarnings("serial")
@WebServlet(description = "Verteilt Dokumenten-Requests anhand des URI-Path an die verschiedenen Handler", urlPatterns = {
    "/getDocument/*"}, loadOnStartup = 1)
public class GetDocDispatcherServlet extends HttpServlet
{
    private static final String ERR_NOT_FOUND = "F\u00fcr den Dokumenten-Kontext '%1$s' liegt keine Implementierung vor. Am besten haust Du Deinen Admin :-)";

    private Map<String, IGetDocServiceHandler> handler;

    /**
     * Der ctor des Servlets laedt alle Handler, welche Dokumenten-Requests bedienen koennen
     */
    public GetDocDispatcherServlet()
    {
        this.loadAllHandlers();
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest req, HttpServletResponse rsp) throws ServletException, IOException
    {
        SessionWrapper session = new SessionWrapper(req.getSession());

        String subCtx = this.extractSubContext(req);
        IGetDocServiceHandler handler = this.handler.get(subCtx);
        if (handler == null)
        {
            this.sendNotFoundRsp(subCtx, rsp);
        }
        else
        {
            if (handler.needsSession() && !session.isValid())
            {
                this.sendSessionLostResponse(rsp);
            }
            else
            {
                this.handleRequest(handler, req, rsp, session);
            }
        }
    }

    /**
     * @param handler
     * @param req
     * @param rsp
     * @param session
     */
    private void handleRequest(IGetDocServiceHandler handler, HttpServletRequest req, HttpServletResponse rsp,
        SessionWrapper session)
    {
        try
        {
            handler.handleRequest(req, rsp, session);
        }
        catch (Exception e)
        {
            this.sendError(rsp, e);
        }
    }

    /**
     * Zurück zur LoginPage
     * 
     * @param rsp 
     */
    private void sendSessionLostResponse(HttpServletResponse rsp)
    {
        rsp.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
        rsp.setHeader("Location", "../index.html");
    }

    /**
     * @param e
     */
    private void sendError(HttpServletResponse rsp, Exception e)
    {
        // TODO Auto-generated method stub

    }

    /**
     * Extrahiere den SubContext aus dem Request. Fuehrende und abschließende "/" 
     * werden entfernt
     * 
     * @param req
     * @return den Namen des SubContext
     */
    private String extractSubContext(HttpServletRequest req)
    {
        String subCtx = req.getPathInfo();
        return this.trimSlashes(subCtx);
    }

    /**
     * Entferne von einem SubContext fuehrende oder folgende "/"-Sequenzen
     * @param subCtx
     * @return
     */
    private String trimSlashes(String subCtx)
    {
        while (subCtx.startsWith("/"))
        {
            subCtx = subCtx.substring(1);
        }
        while (subCtx.endsWith("/"))
        {
            subCtx = subCtx.substring(0, subCtx.length() - 1);
        }
        return subCtx;
    }

    /**
     * Sende eine "NotFound"-Antwort
     * @param req
     * @param rsp
     * @throws IOException 
     * @throws UnsupportedEncodingException 
     */
    private void sendNotFoundRsp(String subCtx, HttpServletResponse rsp)
        throws UnsupportedEncodingException, IOException
    {
        rsp.setStatus(404);
        rsp.setContentType("text/text; encoding=UTF-8");
        rsp.getOutputStream().write(String.format(ERR_NOT_FOUND, subCtx).getBytes("UTF-8"));
    }

    /**
     * lade alle Service-Implementierungen und binde sie an die SubURI's
     */
    private void loadAllHandlers()
    {
        try
        {
            this.handler = new HashMap<String, IGetDocServiceHandler>();
            ServiceLoader<IGetDocServiceHandler> loader = ServiceLoader.load(IGetDocServiceHandler.class);
            for (IGetDocServiceHandler impl : loader)
            {
                String responsibleFor = this.trimSlashes(impl.getResponsibleFor());
                this.handler.put(responsibleFor, impl);
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
