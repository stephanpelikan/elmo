package at.elmo.util.pdf.fillin.handlers;

import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import at.elmo.util.pdf.fillin.elements.FillInElement;

/**
 * The interface defining a FillInElement-handler's prime methods.
 * 
 * @author pelikast
 */
public interface Handler {

	void process(
			final PDRectangle cropBox,
			final PDPageContentStream contentStream,
			final FillInElement element) throws IOException;
	
}
