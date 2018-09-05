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
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.member.MemberDBUtils;
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
        result.add(CalendarModel.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#handleRequest(de.eddies.service.IJAXBObject, de.eddies.service.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;

        IJAXBObject result = null;
        Request req = (Request) request;
        try
        {
            conn = ConnectionPool.getConnection();

            CalendarModel rsp = new CalendarModel();
            rsp.keeperEntries = this.getKeeperTermins(req, conn);
            rsp.purifierEntries = this.getPurifierTermins(req, conn);
            rsp.members = MemberDBUtils.getAllMembers(conn);
            result = rsp;
        }
        catch (SQLException e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }
    
    /**
     * @param req
     * @param conn
     * @return
     * @throws SQLException 
     */
    private List<KeeperTermin> getKeeperTermins(Request req, Connection conn) throws SQLException {
        
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            stmt = conn.prepareStatement("select * from keeper_termine where date between ? and ? order by date, begin");
            stmt.setDate(1, req.from);
            stmt.setDate(2, req.until);
            rs = stmt.executeQuery();

            List<KeeperTermin> result = new ArrayList<>();
            while (rs.next())
            {
                KeeperTermin c = new KeeperTermin();
                c.id = rs.getInt("id");
                c.date = rs.getDate("date");
                c.begin = rs.getTime("begin");
                c.end = rs.getTime("end");
                c.member = rs.getInt("member");
                result.add(c);
            }       
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param req
     * @param conn
     * @return
     * @throws SQLException 
     */
    private List<PurifierTermin> getPurifierTermins(Request req, Connection conn) throws SQLException {
        
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            stmt = conn.prepareStatement("select * from purifier_termine where date between ? and ? order by date");
            stmt.setDate(1, req.from);
            stmt.setDate(2, req.until);
            rs = stmt.executeQuery();

            List<PurifierTermin> result = new ArrayList<>();
            while (rs.next())
            {
                PurifierTermin c = new PurifierTermin();
                c.id = rs.getInt("id");
                c.date = rs.getDate("date");
                c.member = rs.getInt("member");
                result.add(c);
            }       
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
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
}
