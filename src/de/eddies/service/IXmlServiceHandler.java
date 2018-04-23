package de.eddies.service;

import java.util.Collection;


/**
 * Das Interface, welches die Schnittstellen aller ServiceImplementierungen
 * definiert. Die Services selbst werden per ServiceLoader geladen.
 * 
 * 
 *
 */
public interface IXmlServiceHandler
{
    /**
     * @return die Klasse des RequestObjects, fuer welches diese 
     *         Implementierung zustaendig ist
     */
    public Class<? extends IJAXBObject> getResponsibleFor();
    
    /**
     * welche IJAXBObjekte werden in diesem Handler verwendet?
     * 
     * @return
     */
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses();
    
    /**
     * die eigentliche ServiceImpl
     * 
     * @param request
     * @param session
     * @return
     */
    public IJAXBObject handleRequest(IJAXBObject request);
}
