package de.eddies.mainview;

import java.sql.Date;
import java.sql.Time;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.service.IJAXBObject;
import de.eddies.utils.SQLDateXMLAdapter;
import de.eddies.utils.SQLTimeXMLAdapter;

@XmlType(name="CalendarEntry")
public class CalendarEntry implements IJAXBObject
{
    @XmlElement(name="id")
    public int id;

    @XmlElement(name="date")
    @XmlJavaTypeAdapter(value=SQLDateXMLAdapter.class)
    public Date date;
    
    @XmlElement(name="begin")
    @XmlJavaTypeAdapter(value=SQLTimeXMLAdapter.class)
    public Time begin;
    
    @XmlElement(name="end")
    @XmlJavaTypeAdapter(value=SQLTimeXMLAdapter.class)
    public Time end; 
    
    @XmlElement(name="keeper")
    public int keeper = -1;
    
    @XmlElement(name="purifier")
    public int purifier = -1;
}
