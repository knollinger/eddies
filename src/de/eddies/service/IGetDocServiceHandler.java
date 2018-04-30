package de.eddies.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.session.SessionWrapper;

/**
 * Das Interface, welches alle Servicehandler definiert die Dokumente liefern
 * 
 */
public interface IGetDocServiceHandler
{
    /**
     * Fuer welche SUB-URI ist der Handler zustaendig?
     * @return
     */
    public String getResponsibleFor();

    /**
     * benötigt dieser Handler eine Session ?
     * 
     * @return
     */
    public boolean needsSession();

    /**
     * verarbeite den Request
     * 
     * @param req
     * @param rsp
     * @param session
     * @throws Exception 
     */
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception;
}
