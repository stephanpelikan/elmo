package at.elmo.util.pdf.fillin;

import at.elmo.util.pdf.fillin.processors.CsvProcessor;
import at.elmo.util.pdf.fillin.processors.FreemarkerCsvProcessor;

import java.io.File;

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
                
                System.err.println("At least one of the given files does not exist:");
                if (!configuration.exists()) {
                    System.err.println(args[0]);
                }
                if (!data.exists()) {
                    System.err.println(args[1]);
                }
                if (!inputPdf.exists()) {
                    System.err.println(args[2]);
                }
                System.exit(1);
                
            }
            
            try {
    
                CsvProcessor processor = new FreemarkerCsvProcessor(configuration);
                
                newPdf.createNewFile();
                processor.process(inputPdf, data, CSV_ENCODING, newPdf);
                
            } catch (Exception e) {
                
                System.err.println("The new PDF "
                        + newPdf.getAbsolutePath()
                        + " could not be created!");
                e.printStackTrace();
                System.exit(1);
                
            }
            
            
        }

    }
    
    private static void usage() {
        
        final String message = "Use the tool like this:\n";
        final String jarRun = "    java -jar pdf-fill-in-commandlinetool.jar";
        final String parameters = "configuration.csv data.csv given_pdf.pdf filled_pdf.pdf";
        
        final String usageString =
                message + "\n"
                + jarRun + " " 
                + parameters;
        
        System.out.println(usageString);
    }

}
