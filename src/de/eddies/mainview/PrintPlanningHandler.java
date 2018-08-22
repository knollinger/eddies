package de.eddies.mainview;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.pdf.DocBuilder;
import de.eddies.pdf.DocBuilder.DocPart;
import de.eddies.pdf.PDFCreator;
import de.eddies.service.IGetDocServiceHandler;
import de.eddies.session.SessionWrapper;
import de.eddies.utils.IOUtils;

/**
 *
 */
public class PrintPlanningHandler implements IGetDocServiceHandler
{
    private static SimpleDateFormat DATE_FMT = new SimpleDateFormat("EE\ndd.MM.yyyy");
    private static SimpleDateFormat TIME_FMT = new SimpleDateFormat("HH:mm");

    @Override
    public String getResponsibleFor()
    {
        return "planning.pdf";
    }

    @Override
    public boolean needsSession()
    {
        return true;
    }

    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        InputStream in = null;
        try
        {
            String docPath = "/" + this.getClass().getPackage().getName().replaceAll("\\.", "/") + "/planning.adoc";
            in = this.getClass().getResourceAsStream(docPath);
            DocBuilder db = new DocBuilder(in);

            Date from = this.extractDateParam(req, "from");
            Date until = this.extractDateParam(req, "until");
            this.makeHeader(db, from, until);
            this.makeRows(db, from, until);

            byte[] pdf = PDFCreator.transform(db.getDocument());
            rsp.setContentLength(pdf.length);
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.setContentType("application/pdf");
            // TODO: nocache setzen

            rsp.getOutputStream().write(pdf);
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @param db
     * @param from
     * @param until
     */
    private void makeHeader(DocBuilder db, Date from, Date until)
    {
        DocPart part = db.duplicateSection("HEADER");
        part.replaceTag("$FROM$", from);
        part.replaceTag("$UNTIL$", until);
        part.commit();
        db.removeSection("HEADER");

    }

    /**
     * @param db
     * @param from
     * @param until
     * @throws SQLException 
     */
    private void makeRows(DocBuilder db, Date from, Date until) throws SQLException
    {
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            while (from.compareTo(until) <= 0)
            {
                this.fillOneDay(db, from, conn);

                Calendar c = Calendar.getInstance();
                c.setTime(from);
                c.add(Calendar.DATE, 1);
                from = new Date(c.getTimeInMillis());
            }
            db.removeSection("ROW");
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param db
     * @param date
     * @throws SQLException 
     */
    private void fillOneDay(DocBuilder db, Date date, Connection conn) throws SQLException
    {
        DocPart part = db.duplicateSection("ROW");
        part.replaceTag("$DATE$", DATE_FMT.format(date));
        this.fillKeeper(part, date, conn);
        this.fillPurifier(part, date, conn);
        part.commit();
    }

    /**
     * @param part
     * @param date
     * @param conn
     * @throws SQLException 
     */
    private void fillKeeper(DocPart part, Date date, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        StringBuilder keepers = new StringBuilder();
        try
        {
            stmt = conn.prepareStatement(
                "select k.begin, k.end, a.zname, a.vname from keeper_termine k left join accounts a on k.member = a.id where date=? order by k.begin");
            stmt.setDate(1, date);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                String from = TIME_FMT.format(rs.getTime("k.begin"));
                String until = TIME_FMT.format(rs.getTime("k.end"));
                String vname = rs.getString("a.vname");
                String zname = rs.getString("a.zname");
                String line = String.format("%1$s-%2$s %3$s %4$s", from, until, vname, zname);

                if (keepers.length() != 0)
                {
                    keepers.append("\n");
                }
                keepers.append(line);
            }
            part.replaceTag("$KEEPER$", keepers.toString());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param part
     * @param date
     * @param conn
     * @throws SQLException 
     */
    private void fillPurifier(DocPart part, Date date, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        StringBuilder keepers = new StringBuilder();
        try
        {
            stmt = conn.prepareStatement(
                "select a.zname, a.vname from purifier_termine k left join accounts a on k.member = a.id where date=? order by a.vname");
            stmt.setDate(1, date);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                String vname = rs.getString("a.vname");
                String zname = rs.getString("a.zname");
                String line = String.format("%1$s %2$s", vname, zname);

                if (keepers.length() != 0)
                {
                    keepers.append("\n");
                }
                keepers.append(line);
            }
            part.replaceTag("$PURIFIER$", keepers.toString());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param req
     * @param name
     * @return
     */
    private Date extractDateParam(HttpServletRequest req, String name)
    {
        String val = req.getParameter(name);
        return new Date(Long.parseLong(val));
    }
}
