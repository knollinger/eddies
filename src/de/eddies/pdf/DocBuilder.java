package de.eddies.pdf;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Date;
import java.sql.Time;
import java.text.SimpleDateFormat;

import de.eddies.utils.IOUtils;


/**
 * Der {@link DocBuilder} dient erst einmal dazu, ASCIIDOC-Doc-Vorlagen mit Daten 
 * zu befüllen.
 *
 */
public class DocBuilder
{
    private static SimpleDateFormat dateFormatter = new SimpleDateFormat("dd.MM.yyyy");
    private static SimpleDateFormat timeFormatter = new SimpleDateFormat("HH:mm");

    private StringBuilder buffer;


    /**
     * @param templateIn
     * @throws IOException 
     */
    public DocBuilder(InputStream templateIn) throws IOException
    {
        ByteArrayOutputStream tmp = new ByteArrayOutputStream();
        IOUtils.transferUntilEOF(templateIn, tmp);
        this.buffer = new StringBuilder(new String(tmp.toByteArray(), "UTF-8"));
    }

    /**
     * @return
     * @throws IOException
     */
    public InputStream getDocument() throws IOException
    {
        System.out.println(this.buffer.toString());
        return new ByteArrayInputStream(this.buffer.toString().getBytes("UTF-8"));
    }

    /**
     * 
     * @param sectionName
     * @return
     */
    public DocPart duplicateSection(String sectionName)
    {
        String startTag = String.format("{%1$s}", sectionName);
        String endTag = String.format("{/%1$s}", sectionName);

        int insertPos = this.buffer.indexOf(startTag);
        int startPos = insertPos + startTag.length();
        int endPos = this.buffer.indexOf(endTag, startPos);

        int contentLen = endPos - startPos;
        String part = this.buffer.substring(startPos, endPos);
        this.buffer.insert(insertPos, part);
        return new DocPart(this.buffer, insertPos, insertPos + contentLen);
    }

    /**
     * 
     * @param sectionName
     * @return
     */
    public void removeSection(String sectionName)
    {
        String startTag = String.format("{%1$s}", sectionName);
        String endTag = String.format("{/%1$s}", sectionName);
        int startPos = this.buffer.indexOf(startTag);
        int endPos = this.buffer.indexOf(endTag, startPos) + endTag.length();
        this.buffer.delete(startPos, endPos);
    }

    /**
     *
     */
    public class DocPart
    {
        private StringBuilder buffer;
        private String workingCopy;

        private int start;
        private int end;

        /**
         * @param b
         * @param start
         * @param len
         */
        public DocPart(StringBuilder b, int start, int end)
        {
            this.buffer = b;
            this.start = start;
            this.end = end;
            this.workingCopy = new String(b.substring(start, end));
        }

        /**
         * 
         * @param key
         * @param replacement
         */
        public void replaceTag(String key, String replacement)
        {
            String value = (replacement == null) ? "" : replacement;
            value = value.replaceAll("\n", " +\n");
            this.workingCopy = this.workingCopy.replace(key, value);
        }

        /**
         * @param key
         * @param date
         */
        public void replaceTag(String key, Date date)
        {
            this.replaceTag(key, (date == null) ? "" : dateFormatter.format(date));
        }

        /**
         * @param key
         * @param time
         */
        public void replaceTag(String key, Time time)
        {
            this.replaceTag(key, (time == null) ? "" : timeFormatter.format(time));
        }

        /**
         * @param key
         * @param time
         */
        public void replaceTag(String key, int val)
        {
            this.replaceTag(key, Integer.toString(val));
        }

        /**
         * @param key
         * @param time
         */
        public void replaceTag(String key, double val)
        {
            this.replaceTag(key, Double.toString(val));
        }

        /**
         * 
         */
        public void commit()
        {
            this.buffer.replace(this.start, this.end, this.workingCopy);
            this.end = this.workingCopy.length();
        }

    }


}
