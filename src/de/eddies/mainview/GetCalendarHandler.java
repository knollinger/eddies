package de.eddies.mainview;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;
import de.eddies.session.SessionWrapper;
import de.eddies.utils.SQLDateXMLAdapter;

/**
 * Liefert die Kalender-Einträge in einem gegebenen Zeitraum
 *
 */
public class GetCalendarHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#handleRequest(de.eddies.service.IJAXBObject, de.eddies.service.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        IJAXBObject result = null;
        Request req = (Request) request;
        try
        {
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select * from cal_entries where date between ? and ? order by date");
            stmt.setDate(1, req.from);
            stmt.setDate(2, req.until);
            rs = stmt.executeQuery();
            
            Response rsp = new Response();
            while (rs.next())
            {
                CalendarEntry c = new CalendarEntry();
                c.id = rs.getInt("id");
                c.date = rs.getDate("date");
                c.begin = rs.getTime("begin");
                c.end = rs.getTime("end");                
                rsp.calEntries.add(c);
            }
            result = rsp;
        }
        catch (SQLException e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    /**
     * Das Request-Objekt
     */
    @XmlRootElement(name = "get-calendar-req")
    @XmlType(name = "GetCalendarHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "from")
        @XmlJavaTypeAdapter(value = SQLDateXMLAdapter.class)
        public Date from;

        @XmlElement(name = "until")
        @XmlJavaTypeAdapter(value = SQLDateXMLAdapter.class)
        public Date until;
    }

    /**
     * Das Antwort-Objekt für den OK-Fall
     */
    @XmlRootElement(name = "get-calendar-ok-rsp")
    @XmlType(name = "GetCalendarHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElementWrapper(name = "entries")
        @XmlElement(name = "entry")
        List<CalendarEntry> calEntries = new ArrayList<>();
    }
}
