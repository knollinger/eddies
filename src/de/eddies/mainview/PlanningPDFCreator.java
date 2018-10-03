package de.eddies.mainview;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.joda.time.Interval;

import de.eddies.database.DBUtils;
import de.eddies.gapscanner.GapFinder;
import de.eddies.pdf.DocBuilder;
import de.eddies.pdf.DocBuilder.DocPart;
import de.eddies.pdf.PDFCreator;
import de.eddies.utils.IOUtils;

/**
 *
 */
public class PlanningPDFCreator
{
    private static SimpleDateFormat DATE_FMT = new SimpleDateFormat("EE\ndd.MM.yyyy");
    private static SimpleDateFormat TIME_FMT = new SimpleDateFormat("HH:mm");


    /**
     * @param from
     * @param until
     * @param conn
     * @return
     * @throws SQLException
     * @throws IOException 
     * @throws InterruptedException 
     */
    public static byte[] createPlanningPDF(Date from, Date until, Connection conn)
        throws SQLException, IOException, InterruptedException
    {
        InputStream in = null;
        try
        {
            String docPath = "/" + PlanningPDFCreator.class.getPackage().getName().replaceAll("\\.", "/")
                + "/planning.adoc";
            in = PlanningPDFCreator.class.getResourceAsStream(docPath);
            DocBuilder db = new DocBuilder(in);

            Map<Date, List<Interval>> allGaps = GapFinder.findAllGaps(from, until, conn);
            PlanningPDFCreator.makeHeader(db, from, until);
            PlanningPDFCreator.makeRows(db, from, until, allGaps, conn);

            return PDFCreator.transform(db.getDocument());

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
    private static void makeHeader(DocBuilder db, Date from, Date until)
    {
        DocPart part = db.duplicateSection("HEADER");
        part.replaceTag("$FROM$", from);
        part.replaceTag("$UNTIL$", until);
        part.replaceTag("$TODAY$", new Date(System.currentTimeMillis()));
        part.commit();
        db.removeSection("HEADER");

    }

    /**
     * @param db
     * @param from
     * @param until
     * @param allGaps 
     * @throws SQLException 
     */
    private static void makeRows(DocBuilder db, Date from, Date until, Map<Date, List<Interval>> allGaps,
        Connection conn) throws SQLException
    {
        while (from.compareTo(until) <= 0)
        {
            PlanningPDFCreator.fillOneDay(db, from, allGaps.get(from), conn);

            Calendar c = Calendar.getInstance();
            c.setTime(from);
            c.add(Calendar.DATE, 1);
            from = new Date(c.getTimeInMillis());
        }
        db.removeSection("ROW");
    }

    /**
     * @param db
     * @param date
     * @param gaps 
     * @throws SQLException 
     */
    private static void fillOneDay(DocBuilder db, Date date, List<Interval> gaps, Connection conn) throws SQLException
    {
        DocPart part = db.duplicateSection("ROW");
        part.replaceTag("$DATE$", DATE_FMT.format(date));
        PlanningPDFCreator.fillKeeper(part, date, gaps, conn);
        PlanningPDFCreator.fillGaps(part, gaps, conn);
        PlanningPDFCreator.fillPurifier(part, date, conn);
        part.commit();
    }

    /**
     * @param part
     * @param date
     * @param gaps
     * @param conn
     * @throws SQLException 
     */
    private static void fillKeeper(DocPart part, Date date, List<Interval> gaps, Connection conn) throws SQLException
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
            if (!rs.next())
            {
                PlanningPDFCreator.makeClosedDay(part, date, gaps, conn);
            }
            else
            {
                do
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
                while (rs.next());
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
     * @param closeComment 
     * @throws SQLException 
     */
    private static void makeClosedDay(DocPart part, Date date, List<Interval> gaps, Connection conn) throws SQLException
    {

        String replacement = "pass:q[<color r=\"0\" b=\"0\" g=\"255\">*Geschlossen*</color>]";
        part.replaceTag("$KEEPER$", replacement);
//        part.replaceTag("$GAPS$", "");
    }


    /**
     * @param part
     * @param gaps
     * @param conn
     * @throws SQLException 
     */
    private static void fillGaps(DocPart part, List<Interval> gaps, Connection conn) throws SQLException
    {
        StringBuilder result = new StringBuilder();
        if (gaps != null)
        {
            for (Interval gap : gaps)
            {
                if (result.length() > 0)
                {
                    result.append("\n");
                }
                result.append("pass:q[<color r=\"255\" b=\"0\" g=\"0\">*");
                result.append(TIME_FMT.format(gap.getStart().toDate()));
                result.append(" - ");
                result.append(TIME_FMT.format(gap.getEnd().toDate()));
                result.append("*</color>]");
            }
        }
        part.replaceTag("$GAPS$", result.toString());
    }

    /**
     * @param part
     * @param date
     * @param conn
     * @throws SQLException 
     */
    private static void fillPurifier(DocPart part, Date date, Connection conn) throws SQLException
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
}
