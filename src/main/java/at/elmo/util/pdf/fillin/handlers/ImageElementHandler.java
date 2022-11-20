package at.elmo.util.pdf.fillin.handlers;

import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import at.elmo.util.pdf.fillin.elements.FillInElement;

/**
 * Writes TextElements into the given pdf-page.
 * 
 * @author pelikast
 */
public class ImageElementHandler implements Handler {

    /**
     * @param page
     *            The page
     * @param element
     *            The element
     * @see Handler#process(PDPage, FillInElement)
     */
    @Override
    public void process(
            final PDRectangle mediaBox,
            final PDPageContentStream contentStream,
            final FillInElement element) throws IOException {

        // final ImageElement imagelement = (ImageElement) element;
        
        // TODO

    }
    
}
