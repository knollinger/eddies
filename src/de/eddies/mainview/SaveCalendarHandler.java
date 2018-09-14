package de.eddies.mainview;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.service.ErrorResponse;
import de.eddies.service.IJAXBObject;
import de.eddies.service.IXmlServiceHandler;
import de.eddies.session.SessionWrapper;

/**
 * Liefert die Kalender-Einträge in einem gegebenen Zeitraum
 *
 */
public class SaveCalendarHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#needSession()
     */
    @Override
    public boolean needSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return CalendarModel.class;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(CalendarModel.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.eddies.service.IXmlServiceHandler#handleRequest(de.eddies.service.IJAXBObject, de.eddies.service.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;
        Connection conn = null;
        CalendarModel model = (CalendarModel) request;
        try
        {
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            this.handleKeeperChanges(model.keeperEntries, conn);
            this.handlePurifierChanges(model.purifierEntries, conn);
            this.handleCommentChanges(model.comments, conn);

            conn.commit();
            result = new Response();
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
     * @param keeperEntries
     * @param conn
     * @throws SQLException 
     */
    private void handleKeeperChanges(List<KeeperTermin> keeperEntries, Connection conn) throws SQLException
    {
        for (KeeperTermin entry : keeperEntries)
        {
            switch (entry.action)
            {
                case CREATE :
                    this.createKeeperEntry(entry, conn);
                    break;

                case MODIFY :
                    this.updateKeeperEntry(entry, conn);
                    break;

                case REMOVE :
                    this.removeKeeperEntry(entry, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException 
     */
    private void createKeeperEntry(KeeperTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("insert into keeper_termine set date=?, begin=?, end=?, member=?");
            stmt.setDate(1, entry.date);
            stmt.setTime(2, entry.begin);
            stmt.setTime(3, entry.end);
            stmt.setInt(4, entry.member);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException 
     */
    private void updateKeeperEntry(KeeperTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update keeper_termine set date=?, begin=?, end=?, member=? where id=?");
            stmt.setDate(1, entry.date);
            stmt.setTime(2, entry.begin);
            stmt.setTime(3, entry.end);
            stmt.setInt(4, entry.member);
            stmt.setInt(5, entry.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException
     */
    private void removeKeeperEntry(KeeperTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from keeper_termine where id=?");
            stmt.setInt(1, entry.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param purifierEntries
     * @param conn
     * @throws SQLException 
     */
    private void handlePurifierChanges(List<PurifierTermin> purifierEntries, Connection conn) throws SQLException
    {
        for (PurifierTermin entry : purifierEntries)
        {
            switch (entry.action)
            {
                case CREATE :
                    this.createPurifierEntry(entry, conn);
                    break;

                case MODIFY :
                    this.updatePurifierEntry(entry, conn);
                    break;

                case REMOVE :
                    this.removePurifierEntry(entry, conn);
                    break;

                default :
                    break;
            }

        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException 
     */
    private void createPurifierEntry(PurifierTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("insert into purifier_termine set date=?, member=?");
            stmt.setDate(1, entry.date);
            stmt.setInt(2, entry.member);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException 
     */
    private void updatePurifierEntry(PurifierTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update purifier_termine set date=?, member=? where id=?");
            stmt.setDate(1, entry.date);
            stmt.setInt(2, entry.member);
            stmt.setInt(3, entry.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param entry
     * @param conn
     * @throws SQLException
     */
    private void removePurifierEntry(PurifierTermin entry, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from purifier_termine where id=?");
            stmt.setInt(1, entry.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param comments
     * @param conn
     * @throws SQLException 
     */
    private void handleCommentChanges(List<Comment> comments, Connection conn) throws SQLException
    {
        for (Comment comment : comments)
        {
            switch (comment.action)
            {
                case CREATE :
                    this.createComment(comment, conn);
                    break;

                case MODIFY :
                    this.updateComment(comment, conn);
                    break;

                default :
                    break;
            }
        }

    }


    /**
     * @param comment
     * @param conn
     * @throws SQLException 
     */
    private void createComment(Comment comment, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into notes set closed=?, date=?, text=?");
            stmt.setString(1, Boolean.toString(comment.isClosed));
            stmt.setDate(2, comment.date);
            stmt.setString(3, comment.text);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param comment
     * @param conn
     * @throws SQLException 
     */
    private void updateComment(Comment comment, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("update notes set closed=?, date=?, text=? where id=?");
            stmt.setString(1, Boolean.toString(comment.isClosed));
            stmt.setDate(2, comment.date);
            stmt.setString(3, comment.text);
            stmt.setInt(4, comment.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * Das Request-Objekt
     */
    @XmlRootElement(name = "save-calender-model-ok-rsp")
    @XmlType(name = "SaveCalendarHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
