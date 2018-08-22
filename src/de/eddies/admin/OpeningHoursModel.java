package de.eddies.admin;

import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.service.EAction;
import de.eddies.service.IJAXBObject;
import de.eddies.utils.SQLTimeXMLAdapter;

/**
 *
 */
@XmlRootElement(name = "opening-hours-model")
public class OpeningHoursModel implements IJAXBObject
{
    @XmlElement(name="entry")
    public List<Entry> entries = new ArrayList<>();
    
    public static class Entry
    {
        @XmlElement(name = "action")
        public EAction action = EAction.NONE;
        
        @XmlElement(name = "day-of-week")
        public int dayOfWeek;

        @XmlElement(name = "from", nillable=true, required=true)
        @XmlJavaTypeAdapter(value = SQLTimeXMLAdapter.class)
        public Time from;

        @XmlElement(name = "until", nillable=true, required=true)
        @XmlJavaTypeAdapter(value = SQLTimeXMLAdapter.class)
        public Time until;
    }
}
