package de.eddies.utils;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;

/**
 * 
 *
 */
public class IOUtils
{
    /**
     * @param c
     */
    public static void closeQuitly(Closeable c)
    {
        if (c != null)
        {
            try
            {
                c.close();
            }
            catch (IOException e)
            {
            }
        }
    }

    /**
     * @param conn
     */
    public static void closeQuitly(URLConnection conn)
    {
        if (conn != null)
        {
            try
            {
                conn.getInputStream().close();
            }
            catch (IOException e)
            {
            }
        }
    }

    /**
     * @param in
     * @param out
     * @return
     * @throws IOException
     */
    public static int transferUntilEOF(InputStream in, OutputStream out) throws IOException
    {
        int transferred = 0;

        byte[] buffer = new byte[8192];
        int read = in.read(buffer);
        while (read != -1)
        {
            out.write(buffer, 0, read);
            out.flush();
            transferred += read;
            read = in.read(buffer);
        }
        return transferred;
    }
}
