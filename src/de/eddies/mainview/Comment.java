package de.eddies.mainview;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.service.EAction;
import de.eddies.utils.SQLDateXMLAdapter;

/**
 * @author anderl
 *
 */
public class Comment
{
    @XmlElement(name="id")
    public int id;
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;

    @XmlElement(name="closed")
    public boolean isClosed = false;
    
    @XmlJavaTypeAdapter(value = SQLDateXMLAdapter.class)
    @XmlElement(name="date")
    public Date date = new Date(0);

    @XmlElement(name="text")
    public String text = "";
}

