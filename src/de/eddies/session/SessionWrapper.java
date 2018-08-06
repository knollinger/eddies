package de.eddies.session;

import javax.servlet.http.HttpSession;

/**
 * Der SessionWrapper verpackt eine HttpSession und liefert Convinience-Methoden, 
 * um auf die mit der Session assozierten Daten zugreifen zu können.
 */
public class SessionWrapper
{
    private HttpSession httpSession = null;

    /**
     * @param httpSession
     */
    public SessionWrapper(HttpSession httpSession)
    {
        this.httpSession = httpSession;
    }

    /**
     * Die eigentliche "isValid"-Steuerung liegt bei der Servlet-Engine. Aus Sicht des 
     * SessionWrappers ist die Session gültig, wenn ein AccountName gesetzt ist.
     * 
     * @return
     */
    public boolean isValid()
    {
        return this.getAccountId() != null;
    }

    /**
     * Invalidiere die Session
     */
    public void invalidate()
    {
        this.httpSession.invalidate();
    }

    /**
     * @return die mit der Session assozierte AccountID
     */
    public Integer getAccountId()
    {
        return (Integer)this.httpSession.getAttribute("eddies.accountid");
    }

    /**
     * @param name
     */
    public void setAccountId(Integer accountId)
    {
        this.httpSession.setAttribute("eddies.accountid", accountId);
    }

    /**
     * @return die mit der Session assozierte AccountID
     */
    public String getEmail()
    {
        return (String)this.httpSession.getAttribute("eddies.email");
    }

    /**
     * @param name
     */
    public void setEmail(String email)
    {
        this.httpSession.setAttribute("eddies.email", email);
    }

    /**
     * @return die jsessionId
     */
    public String getSessionId()
    {
        return this.httpSession.getId();
    }
}