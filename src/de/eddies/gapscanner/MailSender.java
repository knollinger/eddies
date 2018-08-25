package de.eddies.gapscanner;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import javax.xml.bind.JAXBException;

import de.eddies.database.DBUtils;
import de.eddies.mainview.PlanningPDFCreator;
import de.eddies.setup.EmailSetup;
import de.eddies.setup.SetupReader;
import de.eddies.utils.DateComparator;
import de.eddies.utils.IOUtils;

public class MailSender
{
    private static final String SUBJECT = "Eddies: offene Theken-Termine";
    private static SimpleDateFormat DATE_FMT = new SimpleDateFormat("EE\ndd.MM.yyyy");
    private static SimpleDateFormat TIME_FMT = new SimpleDateFormat("HH:mm");

    /**
     * @param allGaps
     */
    public static void sendReminder(Map<Date, Intervals> allGaps, Connection conn)
    {
        try
        {
            Message msg = MailSender.composeMessage(allGaps, conn);
            Transport.send(msg);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }


    /**
     * @param gaps
     * @param conn
     * @return
     * @throws MessagingException
     * @throws JAXBException
     * @throws SQLException
     * @throws InterruptedException 
     */
    private static Message composeMessage(Map<Date, Intervals> gaps, Connection conn)
        throws MessagingException, JAXBException, SQLException, IOException, InterruptedException
    {
        Message msg = new MimeMessage(MailSender.getMailSession());
        msg.setSubject(SUBJECT);

        msg.setFrom(new InternetAddress(SetupReader.getSetup().getEmailSetup().send.from));
        //        msg.setRecipients(RecipientType.TO, MailSender.getRecipients(conn));
        msg.setRecipient(RecipientType.TO, new InternetAddress("anderl.knollinger@gmail.com"));

        BodyPart msgBodyPart = new MimeBodyPart();
        msgBodyPart.setContent(MailSender.composeBody(gaps), "text/html");

        // erzeuge den MultiPart und füge schon mal den BodyPart an
        Multipart multipart = new MimeMultipart();
        multipart.addBodyPart(msgBodyPart);

        // Das Attachment mit der aktuellen Schichtplanung einfügen
        BodyPart attachBodyPart = new MimeBodyPart();
        attachBodyPart.setFileName(MailSender.getAttachmentName());
        byte[] data = PlanningPDFCreator.createPlanningPDF(MailSender.getStartDate(), MailSender.getEndDate(), conn);
        String mimeType = "application/pdf";
        DataSource src = new ByteArrayDataSource(data, mimeType);
        attachBodyPart.setDataHandler(new DataHandler(src));
        multipart.addBodyPart(attachBodyPart);

        msg.setContent(multipart);

        return msg;
    }
    
    /**
     * @return
     */
    private static Date getStartDate() {
        
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(System.currentTimeMillis());
        return new Date(c.getTimeInMillis());
    }

    /**
     * @return
     */
    private static Date getEndDate() {
        
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(System.currentTimeMillis());
        c.set(Calendar.DAY_OF_MONTH, c.get(Calendar.DAY_OF_MONTH) + 7);
        return new Date(c.getTimeInMillis());
    }
    
    /**
     * 
     */
    private static String getAttachmentName() {

        Date today = new Date(System.currentTimeMillis());
        SimpleDateFormat fmt = new SimpleDateFormat("dd.MM.yyyy");
        
        return String.format("Eddies-Schichtplanung Stand vom %1$s", fmt.format(today));
    }

    /**
     * @return
     * @throws IOException 
     */
    private static String composeBody(Map<Date, Intervals> allGaps) throws IOException
    {
        InputStream in = null;
        try
        {
            String path = "/" + MailSender.class.getPackage().getName().replaceAll("\\.", "/")
                + "/reminder_mail_template.html";
            in = MailSender.class.getResourceAsStream(path);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            IOUtils.transferUntilEOF(in, buffer);

            String result = new String(buffer.toString("UTF-8"));
            result = result.replace("$GAPS$", MailSender.createGapSection(allGaps));
            return result.toString();
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @param allGaps
     * @return
     */
    private static String createGapSection(Map<Date, Intervals> allGaps)
    {
        StringBuilder result = new StringBuilder();

        List<Date> keys = new ArrayList<>();
        keys.addAll(allGaps.keySet());
        keys.sort(new DateComparator());
        
        for (Date date : keys)
        {
            result.append("<br><b>");
            result.append(DATE_FMT.format(date));
            result.append("</b><br>");

            for (Interval i : allGaps.get(date).getIntervals())
            {
                result.append(TIME_FMT.format(i.getStart()));
                result.append(" - ");
                result.append(TIME_FMT.format(i.getEnd()));
                result.append("<br>");
            }
        }
        return result.toString();
    }


    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    private static InternetAddress[] getRecipients(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            List<InternetAddress> addies = new ArrayList<>();
            stmt = conn.prepareStatement("select email from accounts");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InternetAddress addy = MailSender.resolveAddress(rs.getString("email"));
                if (addy != null)
                {
                    addies.add(addy);
                }
            }

            InternetAddress[] result = new InternetAddress[addies.size()];
            addies.toArray(result);
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param address
     * @return
     */
    public static InternetAddress resolveAddress(String address)
    {
        try
        {
            return new InternetAddress(address);
        }
        catch (AddressException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }

    /**
     * @return
     * @throws JAXBException
     */
    private static Session getMailSession() throws JAXBException
    {
        EmailSetup setup = SetupReader.getSetup().getEmailSetup();

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", setup.send.useStartTLS);
        props.put("mail.smtp.host", setup.send.host);
        props.put("mail.smtp.port", setup.send.port);

        javax.mail.Session sess = javax.mail.Session.getInstance(props, new UIDPwdAuthenticator(setup));
        return sess;
    }

    /**
     * @author anderl
     *
     */
    private static class UIDPwdAuthenticator extends Authenticator
    {
        private String userId;
        private String passwd;

        /**
         * @param setup
         */
        public UIDPwdAuthenticator(EmailSetup setup)
        {
            this.userId = setup.send.user;
            this.passwd = setup.send.passwd;
        }

        /* (non-Javadoc)
         * @see javax.mail.Authenticator#getPasswordAuthentication()
         */
        protected PasswordAuthentication getPasswordAuthentication()
        {
            return new PasswordAuthentication(this.userId, this.passwd);
        }
    }
}
