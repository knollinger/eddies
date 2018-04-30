package de.eddies.member;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlType(name="Member")
public class Member
{
    @XmlElement(name="id")
    public int id;

    @XmlElement(name="zname")
    public String zname;

    @XmlElement(name="vname")
    public String vname;

    @XmlElement(name="phone")
    public String phone;
    
    @XmlElement(name="mobile")
    public String mobile;
    
    @XmlElement(name="email")
    public String email;    
}
