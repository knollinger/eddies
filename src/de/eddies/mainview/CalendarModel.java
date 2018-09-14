package de.eddies.mainview;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.member.Member;
import de.eddies.service.IJAXBObject;

/**
 * Das Antwort-Objekt für den OK-Fall
 */
@XmlRootElement(name = "calendar-model")
@XmlType(name = "CalendarModel")
public class CalendarModel implements IJAXBObject
{
    @XmlElementWrapper(name = "keeper-entries")
    @XmlElement(name = "keeper-entry")
    List<KeeperTermin> keeperEntries = new ArrayList<>();

    @XmlElementWrapper(name = "purifier-entries")
    @XmlElement(name = "purifier-entry")
    List<PurifierTermin> purifierEntries = new ArrayList<>();

    @XmlElementWrapper(name = "comments")
    @XmlElement(name = "comment")
    List<Comment> comments = new ArrayList<>();

    @XmlElementWrapper(name = "members")
    @XmlElement(name = "member")
    List<Member> members = new ArrayList<>();
}