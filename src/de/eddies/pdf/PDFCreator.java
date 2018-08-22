package de.eddies.pdf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import de.eddies.utils.IOUtils;

/**
 * Der {@link PDFCreator} verwendet asciidoctor als externen Prozess um aus
 * AsciiDoc-Documenten PDFs zu erzeugen.
 * 
 * Um das ganze ein wenig erfreulicher zu machen, verzichten wir auf die Erzeugung
 * temporärer Files. AsciiDoctor ist so nett, von stdin zu lesen und auf stdout zu 
 * schreiben. Wenn man ihm das halt anschafft.
 * 
 * @author anderl
 *
 */
public class PDFCreator
{

    /**
     * Starte den PDF-Prozessor und schiebe das InputDocument (als ASCIIDOC) rein.
     * @param asciiDocIn
     * @return
     * @throws IOException 
     * @throws InterruptedException 
     */
    public static byte[] transform(InputStream asciiDocIn) throws IOException, InterruptedException
    {
        List<String> cmdLine = PDFCreator.buildCommandLine();
        ProcessBuilder pb = new ProcessBuilder(cmdLine);
        Process p = pb.start();
        
        IOUtils.transferUntilEOF(asciiDocIn, p.getOutputStream());
        p.getOutputStream().close();
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        IOUtils.transferUntilEOF(p.getInputStream(), result);
        return result.toByteArray();
    }

    /**
     * asciidoctor -r asciidoctor-pdf -b pdf  --out-file=- -
     * 
     * @return
     */
    private static List<String> buildCommandLine()
    {
        List<String> cmds = new ArrayList<>();
        cmds.add("asciidoctor");
        cmds.add("-r");
        cmds.add("asciidoctor-pdf");
        cmds.add("-b");
        cmds.add("pdf");
        cmds.add("-");
        return cmds;
    }
}
