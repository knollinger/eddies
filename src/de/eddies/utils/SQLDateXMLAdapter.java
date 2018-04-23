package de.eddies.utils;

import java.sql.Date;
import java.text.SimpleDateFormat;

import javax.xml.bind.annotation.adapters.XmlAdapter;

public class SQLDateXMLAdapter extends XmlAdapter<String, Date>
{
    @Override
    public String marshal(Date v) throws Exception
    {
        String result = null;
        if (v != null)
        {
            SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
            result = sdf.format(v);
        }
        return result;
    }

    @Override
    public Date unmarshal(String v) throws Exception
    {
        Date result = null;
        if (v != null && v.trim().length() != 0)
        {
            SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
            result = new Date(sdf.parse(v.trim()).getTime());
        }
        return result;
    }
}
