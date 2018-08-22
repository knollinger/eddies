package de.eddies.utils;

import java.sql.Time;
import java.text.SimpleDateFormat;

import javax.xml.bind.annotation.adapters.XmlAdapter;

public class SQLTimeXMLAdapter extends XmlAdapter<String, Time>
{
    @Override
    public String marshal(Time v) throws Exception
    {
        String result = "";
        if (v != null)
        {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
            result = sdf.format(v);
        }
        return result;
    }

    @Override
    public Time unmarshal(String v) throws Exception
    {
        Time result = null;
        if (v != null && v.trim().length() != 0)
        {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
            result = new Time(sdf.parse(v.trim()).getTime());
        }
        return result;
    }
}
