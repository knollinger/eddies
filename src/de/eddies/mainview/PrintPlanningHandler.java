package de.eddies.mainview;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.eddies.database.ConnectionPool;
import de.eddies.database.DBUtils;
import de.eddies.service.IGetDocServiceHandler;
import de.eddies.session.SessionWrapper;
import de.eddies.utils.IOUtils;

/**
 *
 */
public class PrintPlanningHandler implements IGetDocServiceHandler
{
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
        Connection conn = null;
        try
        {
            Date from = this.extractDateParam(req, "from");
            Date until = this.extractDateParam(req, "until");
            conn = ConnectionPool.getConnection();
            
            byte[] pdf = PlanningPDFCreator.createPlanningPDF(from, until, conn);
            rsp.setContentLength(pdf.length);
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.setContentType("application/pdf");
            rsp.setDateHeader("Expires", new Date(0).getTime());
            rsp.setDateHeader("Last-Modified", new Date(0).getTime());
            rsp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0");
            rsp.setHeader("Pragma", "no-cache");
            rsp.getOutputStream().write(pdf);
        }
        finally
        {
            DBUtils.closeQuitly(conn);
            IOUtils.closeQuitly(in);
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
