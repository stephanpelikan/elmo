package at.elmo.util.pdf.fillin;

import java.io.File;
import java.io.IOException;

import at.elmo.util.pdf.fillin.processors.CsvProcessor;
import at.elmo.util.pdf.fillin.processors.FreemarkerCsvProcessor;

public class PdfFillIn {
    
    /*
     * UTF-8 encoding assumed while working with the command line utility.
     */
    public static final String CSV_ENCODING = "UTF-8";

    public static void main(String[] args) {
        
        // Handle the arguments
        if (args.length != 4 ) {
            
            usage();
            
        } else {
            
            File configuration = new File(args[0]);
            File data = new File(args[1]);
            File inputPdf = new File(args[2]);
            File newPdf = new File(args[3]);
            
            final boolean filesExist = 
                    configuration.exists()
                    && data.exists()
                    && inputPdf.exists();
            
            if (!filesExist) {
                
                System.out.println("Bitte prüfen Sie ob alle nötigen Dateien existieren!");
                System.exit(0);
            }
            
            try {
    
                CsvProcessor processor = new FreemarkerCsvProcessor(configuration);
                
                newPdf.createNewFile();
                processor.process(inputPdf, data, CSV_ENCODING, newPdf);
                
            } catch (IOException e) {
                
                System.out.println("Der neue Vertrag kann nicht in "
                        + newPdf.getAbsolutePath()
                        + " erschaffen werden!");
                e.printStackTrace();
                
            } catch (Exception e) {
                
                //System.out.println(e.getMessage());
                e.printStackTrace();
                
            }
            
            
        }

    }
    
    private static void usage(){
        
        final String message = "Bitte geben Sie die korrekten Parameter an:\n";
        final String jarRun = "    java -jar pdf-fill-in-commandlinetool.jar";
        final String parameters = "configuration.csv data.csv blank_vertrag.pdf neuer_vertrag.pdf";
        
        final String usageString =
                message + "\n"
                + jarRun + " " 
                + parameters;
        
        System.out.println(usageString);
    }

}
