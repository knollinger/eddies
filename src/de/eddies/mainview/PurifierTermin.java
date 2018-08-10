package de.eddies.mainview;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.service.EAction;
import de.eddies.service.IJAXBObject;
import de.eddies.utils.SQLDateXMLAdapter;

@XmlType(name="PurifierTermin")
public class PurifierTermin implements IJAXBObject
{
    @XmlElement(name="id")
    public int id;
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;

    @XmlElement(name="date")
    @XmlJavaTypeAdapter(value=SQLDateXMLAdapter.class)
    public Date date;
    
    @XmlElement(name="purifier")
    public int member;
}
