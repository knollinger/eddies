package de.eddies.attachments;

import java.sql.Timestamp;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.service.EAction;
import de.eddies.utils.SQLTimestampXMLAdapter;

public class Attachment
{
	@XmlElement(name = "id")
    public int id = -1;

	@XmlElement(name = "name")
	public String name = "";

	@XmlElement(name = "mime-type")
	public String mimeType = "";

	@XmlElement(name = "content")
	public byte[] content = null;

	@XmlElement(name = "attached-by")
	public String attachedBy = "";

	@XmlElement(name = "attached-at")
	@XmlJavaTypeAdapter(value = SQLTimestampXMLAdapter.class)
	public Timestamp attachDate = null;
    
	@XmlElement(name="domain")
	public EAttachmentDomain domain;

	@XmlElement(name = "action")
	public EAction action = EAction.NONE;
}
