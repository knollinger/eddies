package de.eddies.setup;

import java.io.InputStream;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import de.eddies.utils.IOUtils;


/*---------------------------------------------------------------------------*/
public class SetupReader
{
    private static JAXBContext ctx = null;
    private static Setup setup;

    /*---------------------------------------------------------------------------*/
    public static Setup getSetup() throws JAXBException
    {
        if (SetupReader.setup == null)
        {
            String path = "/" + Setup.class.getPackage().getName().replace('.', '/') + "/setup.xml";
            InputStream in = Setup.class.getResourceAsStream(path);

            try
            {
                Unmarshaller u = SetupReader.getContext().createUnmarshaller();
                SetupReader.setup = (Setup) u.unmarshal(in);
            }
            finally
            {
                IOUtils.closeQuitly(in);
            }
        }
        return SetupReader.setup;
    }

    /*---------------------------------------------------------------------------*/
    private static JAXBContext getContext() throws JAXBException
    {
        if (SetupReader.ctx == null)
        {
            synchronized (SetupReader.class)
            {
                if (SetupReader.ctx == null)
                {
                    SetupReader.ctx = JAXBContext.newInstance(Setup.class);
                }
            }
        }
        return SetupReader.ctx;
    }
}
