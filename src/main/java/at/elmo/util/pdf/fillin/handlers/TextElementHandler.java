package at.elmo.util.pdf.fillin.handlers;

import java.awt.Color;
import java.awt.geom.Point2D;
import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import at.elmo.util.pdf.fillin.elements.FillInElement;
import at.elmo.util.pdf.fillin.elements.TextElement;
import at.elmo.util.pdf.fillin.elements.TextElement.Font;
import at.elmo.util.pdf.fillin.processors.PositionUtil;

/**
 * Writes TextElements into the given pdf-page.
 * 
 * @author pelikast
 */
public class TextElementHandler implements Handler {

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

		final TextElement textElement = (TextElement) element;

		// retrieve parameters
		
		final PDFont font = getFont(textElement);
		
		final Point2D position = PositionUtil.getPdfPosition(
				mediaBox,
				element.getHorizontalPosition(),
				element.getVerticalPosition(),
				element.getUnit());

		final float fontSize = PositionUtil.getPoint(
				textElement.getFontSize(),
				element.getUnit());
			
		final float adaptedFontSize = getAdaptedFontSize(
				font,
                fontSize,
				textElement.getMaxLength(),
				textElement.getText());
		
		// place text
        contentStream.setStrokingColor(Color.BLACK);
        contentStream.setNonStrokingColor(Color.BLACK);
        contentStream.beginText();
		contentStream.setFont(
				font,
				adaptedFontSize);
        contentStream.newLineAtOffset(
				(float) position.getX(),
				(float) position.getY());
        contentStream.showText(
				textElement.getText());
		contentStream.endText();

	}

	/**
	 * Reduces the font size to fit the text into a given space.
	 * 
	 * @param font The font
	 * @param originalFontSize The desired font size
	 * @param maxLength The desired maximal length of the text fragment
	 * @param text The text
	 * @return The font size adapting to the space available
	 */
	private float getAdaptedFontSize(
			final PDFont font,
			final float originalFontSize,
			final float maxLength,
			final String text) throws IOException {
		
		// measure width of text according the desired font size
		final float stringWidth = font.getStringWidth(text);
		final float width = stringWidth / 1000 * originalFontSize;
		
		final float maxLenghtInPoints = PositionUtil.mmToPoint(maxLength);
		
		// scale font size if necessary
		final float adaptedFontSize;
		if (width > maxLenghtInPoints) {

			adaptedFontSize = originalFontSize / width * maxLenghtInPoints;
			
		} else {
			
			adaptedFontSize = originalFontSize;
			
		}
		
		return adaptedFontSize;
		
	}
	
	/**
	 * Maps the TextElement's font to a PDFont.
	 * 
	 * @param textElement
	 *            The text-element
	 * @return The PDFont
	 */
	private PDFont getFont(final TextElement textElement) {

		final Font font = textElement.getFont();

		// default-font is helvetica
		if (font == null) {
			return PDType1Font.HELVETICA;
		}

		// map font
		switch (font) {
		case COURIER:
			return PDType1Font.COURIER;
		case COURIER_BOLD:
			return PDType1Font.COURIER_BOLD;
		case COURIER_BOLD_OBLIQUE:
			return PDType1Font.COURIER_BOLD_OBLIQUE;
		case COURIER_OBLIQUE:
			return PDType1Font.COURIER_OBLIQUE;
		case HELVETICA:
			return PDType1Font.HELVETICA;
		case HELVETICA_BOLD:
			return PDType1Font.HELVETICA_BOLD;
		case HELVETICA_BOLD_OBLIQUE:
			return PDType1Font.HELVETICA_BOLD_OBLIQUE;
		case HELVETICA_OBLIQUE:
			return PDType1Font.HELVETICA_OBLIQUE;
		case TIMES_BOLD:
			return PDType1Font.TIMES_BOLD;
		case TIMES_BOLD_ITALIC:
			return PDType1Font.TIMES_BOLD_ITALIC;
		case TIMES_ITALIC:
			return PDType1Font.TIMES_ITALIC;
		case TIMES_ROMAN:
			return PDType1Font.TIMES_ROMAN;
		default:

			throw new RuntimeException(
					"Enum '"
							+ Font.class.getCanonicalName()
							+ "' seems to be extended since initial implementation. "
							+ " Font '"
							+ font.name()
							+ "' cannot be handled propery - extend the switch-instruction!");

		}

	}

}
