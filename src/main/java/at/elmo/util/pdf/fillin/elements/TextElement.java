package at.elmo.util.pdf.fillin.elements;

/**
 * A TextElement's interface. This is not a concrete class to allow the 
 * user to use custom classes (such as JPA-entities).
 * 
 * @author pelikast
 */
public interface TextElement extends FillInElement {
	
	public enum Font {
		TIMES_ROMAN,
		TIMES_BOLD,
		TIMES_ITALIC,
		TIMES_BOLD_ITALIC,
		HELVETICA,
		HELVETICA_BOLD,
		HELVETICA_OBLIQUE,
		HELVETICA_BOLD_OBLIQUE,
		COURIER,
		COURIER_BOLD,
		COURIER_OBLIQUE,
		COURIER_BOLD_OBLIQUE
	};

	/**
	 * @return At the moment only PDF-builtin fonts are supported
	 */
	Font getFont();
	
	/**
	 * @return The font's size measured in units given by getUnit()
	 * @see FillInElement#getUnit()
	 */
	float getFontSize();
	
	/**
	 * @return The text to be printed
	 */
	String getText();
	
	/**
	 * @return If the text is longer then this value the font-size
	 * will be decreasing until the text fits into to given space. 
	 */
	float getMaxLength();
	
}
