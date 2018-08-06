package de.eddies.member;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.service.EAction;

@XmlType(name="Member")
public class Member
{
    @XmlElement(name="id")
    public int id;
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;

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
    
    @XmlElement(name="sex")
    public ESex sex;
    
    @XmlElement(name="role")
    public ERole role;
    
    @XmlElement(name="img")
    public byte[] imgData;
    
    @XmlElement(name="img-type")
    public String imgType;
}
