/**
 * 
 */
package at.elmo.util.pdf.fillin.processors;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Map;

import at.elmo.util.pdf.fillin.elements.TextElement;
import freemarker.cache.StringTemplateLoader;
import freemarker.core.InvalidReferenceException;
import freemarker.core.ParseException;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

/**
 * Processes and combines freemarker templates with data.
 * @author okicir
 * 
 */
public class FreemarkerCsvProcessor extends CsvProcessor {

    private static final String INTERNAL_TEMPLATENAME = "Inhalt";
    
    public FreemarkerCsvProcessor(File configFile) throws Exception {
        super(configFile);
    }
    
    public FreemarkerCsvProcessor(InputStream configStream) throws Exception {
        super(configStream);
    }

    @Override
    protected TextElement getTextElement(
            Map<String, String> elementConfiguration, Map<String, Object> data, int lineNo)
            throws Exception {

        final TextElement result = super.getTextElement(elementConfiguration, data, lineNo);
        
        final CsvTextElement csvTextElement = (CsvTextElement) result;
        csvTextElement.setText(
                FreemarkerCsvProcessor.processTemplate(elementConfiguration.get(COLUMN_NAME_TEXT), data));
        
        return result;
        
    }
    
    
    /**
     * Process a freemarker template string and return a String with variables
     * substituted from {@code data}.
     * @param templateString A freemarker template String.
     * @param data A map containing freemarker vaiable [name]:[value] pairs.
     * @return Complete string from template populated with variable values.
     * @throws Exception
     */
    public static String processTemplate(
            final String templateString,
            final Map<String, Object> data) throws Exception {
        
        String result = null;

        try {

            final StringTemplateLoader templateLoader = new StringTemplateLoader();
            templateLoader.putTemplate(INTERNAL_TEMPLATENAME, templateString);

            final Configuration config = new freemarker.template.Configuration(
                    freemarker.template.Configuration.VERSION_2_3_31);
            config.setDefaultEncoding(CONFIG_ENCODING);
            config.setTemplateLoader(templateLoader);

            final Template inhaltTemplate = config.getTemplate(INTERNAL_TEMPLATENAME);
            
            final Writer out = new StringWriter();
            
            // Catch eventual errors that can be caused from freemarker built-in functions!?
            // e.g. substrgin index out of bounds
            inhaltTemplate.process(data, out);
            
            result = out.toString();

        } catch (ParseException e) {
            
            throw new Exception(
                    "Eine Variable in der CSV Datei enthält syntax Fehler!", e);
            
        } catch (InvalidReferenceException e) {
            
            throw new Exception(
                    "Eine Variable in der CSV Datei "
                    + "entspricht nicht dem Template!", e);
            
        } catch (IOException | TemplateException e) {

            throw new Exception(e);
            
        } 

        return result;
        
    }
    
}
