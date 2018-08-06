package de.eddies.member;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.service.IJAXBObject;

@XmlRootElement(name = "members-model")
@XmlType(name = "MembersModel")
public class MembersModel implements IJAXBObject
{
    @XmlElementWrapper(name = "members")
    @XmlElement(name = "member")
    public List<Member> members = new ArrayList<>();
}