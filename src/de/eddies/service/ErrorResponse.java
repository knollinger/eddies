package de.eddies.service;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "error-response")
public class ErrorResponse implements IJAXBObject
{
    private String msg;

    public ErrorResponse()
    {

    }

    public ErrorResponse(String msg)
    {
        this.msg = msg;
    }

    @XmlElement(name = "msg")
    public String getMsg()
    {
        return msg;
    }

    public void setMsg(String msg)
    {
        this.msg = msg;
    }
}
