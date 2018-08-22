package de.eddies.service;

import java.io.ByteArrayOutputStream;
import java.io.FilterInputStream;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashSet;
import java.util.Set;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

/**
 * Transformiert IJAXBObject-Instanzen in einen Stream oder liest diese daraus.
 *
 */
public class JAXBSerializer
{
    private static Set<Class<? extends IJAXBObject>> registeredClasses = null;
    private static JAXBContext context = null;

    /**
     * Ich mag statische Konstruktoren ja nicht...aber irgendwer muss die
     * ErrorResponse-Klasse ja laden....
     */
    static
    {
        JAXBSerializer.registeredClasses = new HashSet<Class<? extends IJAXBObject>>();
        JAXBSerializer.registeredClasses.add(ErrorResponse.class);
        JAXBSerializer.registeredClasses.add(SessionLostResponse.class);
    }
    
    /**
     * Registriere eine neue Klasse am Serializer
     * @param clazz
     */
    public static void registerClass(Class<? extends IJAXBObject> clazz)
    {
        synchronized (JAXBSerializer.class)
        {
            if (JAXBSerializer.registeredClasses.add(clazz))
            {
                JAXBSerializer.context = null;
            }
        }
    }

    /**
     * @param object
     * @param out
     * @throws JAXBException 
     */
    public static void writeObject(IJAXBObject object, OutputStream out) throws JAXBException
    {
        Marshaller m = JAXBSerializer.getContext().createMarshaller();
        m.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.FALSE);
        m.marshal(object, new CloseShieldedOutputStream(out));
    }
    
    /**
     * @param object
     * @return
     * @throws JAXBException
     */
    public static String stringify(IJAXBObject object) throws JAXBException {
        
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        JAXBSerializer.writeObject(object, byteOut);
        return new String(byteOut.toByteArray());
        
    }

    /**
     * @param in
     * @return
     * @throws JAXBException
     */
    public static IJAXBObject readObject(InputStream in) throws JAXBException
    {
        Unmarshaller m = JAXBSerializer.getContext().createUnmarshaller();
        return (IJAXBObject) m.unmarshal(new CloseShieldedInputStream(in));
    }

    /**
     * @return
     * @throws JAXBException 
     */
    private static JAXBContext getContext() throws JAXBException
    {
        if (JAXBSerializer.context == null)
        {
            synchronized (JAXBSerializer.class)
            {
                if (JAXBSerializer.context == null)
                {
                    Class<?>[] classesToBeBound = new Class[registeredClasses.size()];
                    registeredClasses.toArray(classesToBeBound);
                    JAXBSerializer.context = JAXBContext.newInstance(classesToBeBound);
                }
            }
        }
        return JAXBSerializer.context;
    }

    /*-----------------------------------------------------------------------*/
    private static class CloseShieldedInputStream extends FilterInputStream
    {
        /*-------------------------------------------------------------------*/
        /**
         * @param in
         */
        protected CloseShieldedInputStream(InputStream in)
        {
            super(in);
        }

        /*-------------------------------------------------------------------*/
        public void close() throws IOException
        {
            // do nothing
        }
    }

    /*-----------------------------------------------------------------------*/
    private static class CloseShieldedOutputStream extends FilterOutputStream
    {
        /*-------------------------------------------------------------------*/
        /**
         * @param in
         */
        protected CloseShieldedOutputStream(OutputStream out)
        {
            super(out);
        }

        /*-----------------------------------------------------------------------*/
        public void close() throws IOException
        {
            // do nothing
        }
    }
}
