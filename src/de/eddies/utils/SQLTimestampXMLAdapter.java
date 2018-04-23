package de.eddies.utils;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * XMLAdapter, um SQL-Timestamps nach/in die String-Darstellung 
 * zu ueberfuehren
 *
 */
public class SQLTimestampXMLAdapter extends XmlAdapter<String, Timestamp>
{
    private static final SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy-HH:mm:ss");
    
    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#marshal(java.lang.Object)
     */
    @Override
    public String marshal(Timestamp v) throws Exception
    {
        long time = v.getTime();
        return formatter.format(new Date(time));
    }

    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#unmarshal(java.lang.Object)
     */
    @Override
    public Timestamp unmarshal(String v) throws Exception
    {
        long time = formatter.parse(v).getTime();
        return new Timestamp(time);
    }
}
