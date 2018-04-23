package de.eddies.member;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.service.EAction;
import de.eddies.service.IJAXBObject;

@XmlRootElement(name = "member")
@XmlType(name="Member")
public class Member implements IJAXBObject
{
    @XmlElement(name="id")
    public int id = 0;
    
    @XmlElement(name="action")
    EAction action = EAction.NONE;
    
    @XmlElement(name="zname")
    public String zname = "";

    @XmlElement(name="vname")
    public String vname = "";

    @XmlElement(name="vname2")
    public String vname2 = "";
    
    @XmlElement(name="title")
    public String title = "";
    
    @XmlElement(name="phone")
    public String phone = "";

    @XmlElement(name="mobile")
    public String mobile = "";

    @XmlElement(name="email")
    public String email = "";
}
