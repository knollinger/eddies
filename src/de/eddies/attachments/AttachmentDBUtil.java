package de.eddies.attachments;

import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.eddies.database.DBUtils;
import de.eddies.service.EAction;
import de.eddies.session.SessionWrapper;

/**
 * Datenbank-Util, um Familien-Mitglieder von Mitgliedern zu verarbeiten
 *
 */
public class AttachmentDBUtil
{
    /**
     * @param memberId
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<Attachment> getAllAttachments(int refId, EAttachmentDomain domain, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        Collection<Attachment> result = new ArrayList<Attachment>();
        try
        {
            stmt = conn.prepareStatement("select id, file_name, mimetype, timestamp, attached_by from attachments where ref_id=? and domain=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Attachment attachment = new Attachment();
                attachment.id = rs.getInt("id");
                attachment.name = rs.getString("file_name");
                attachment.mimeType = rs.getString("mimetype");
                attachment.attachDate =  rs.getTimestamp("timestamp");
                attachment.attachedBy = rs.getString("attached_by");
                attachment.domain = domain;
                attachment.action = EAction.NONE;
                result.add(attachment);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return result;
    }

    /**
     * @param Attachments
     * @param memberId
     * @param domain
     * @param conn
     * @throws SQLException
     */
    public static void handleAttachmentChanges(Collection<Attachment> Attachments, int refId, EAttachmentDomain domain,
        SessionWrapper session, Connection conn) throws SQLException
    {
        for (Attachment attachment : Attachments)
        {
            switch (attachment.action)
            {
                case CREATE :
                    AttachmentDBUtil.createAttachment(attachment, refId, domain, session, conn);
                    break;

                case REMOVE :
                    AttachmentDBUtil.removeAttachment(attachment, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param attachment
     * @param refId
     * @param domain 
     * @param session 
     * @param conn
     * @throws SQLException 
     */
    public static void createAttachment(Attachment attachment, int refId, EAttachmentDomain domain, SessionWrapper session,
        Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into attachments set ref_id=?, domain=?, file_name=?, file=?, mimetype=?, attached_by=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            stmt.setString(3, attachment.name);
            stmt.setBlob(4, new ByteArrayInputStream(attachment.content));
            stmt.setString(5, attachment.mimeType);
            stmt.setString(6, session.getAccountName());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param attachment
     * @param conn
     * @throws SQLException 
     */
    private static void removeAttachment(Attachment attachment, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from attachments where id=?");
            stmt.setInt(1, attachment.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /*
     * lösche alle Attachments mit der gegebenen ref_id und der gegebenen Domain 
     */
    public static void deleteAtachments(int refId, EAttachmentDomain domain, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from attachments where ref_id=? and domain=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
