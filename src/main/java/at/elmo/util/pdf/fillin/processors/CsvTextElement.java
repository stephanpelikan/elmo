package at.elmo.util.pdf.fillin.processors;

import at.elmo.util.pdf.fillin.Unit;
import at.elmo.util.pdf.fillin.elements.TextElement;

public class CsvTextElement implements TextElement {

    private int pageNumber;
    
    private float horizontalPosition;
    
    private float verticalPosition;
    
    private Unit unit;
    
    private Font font;
    
    private float fontSize;
    
    private String text;

    private float maxLength;

    @Override
    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(final int pageNumber) {
        this.pageNumber = pageNumber;
    }

    @Override
    public float getHorizontalPosition() {
        return horizontalPosition;
    }

    public void setHorizontalPosition(final float horizontalPosition) {
        this.horizontalPosition = horizontalPosition;
    }

    @Override
    public float getVerticalPosition() {
        return verticalPosition;
    }

    public void setVerticalPosition(final float verticalPosition) {
        this.verticalPosition = verticalPosition;
    }

    @Override
    public Unit getUnit() {
        return unit;
    }

    public void setUnit(final Unit unit) {
        this.unit = unit;
    }

    @Override
    public Font getFont() {
        return font;
    }

    public void setFont(final Font font) {
        this.font = font;
    }

    @Override
    public float getFontSize() {
        return fontSize;
    }

    public void setFontSize(final float fontSize) {
        this.fontSize = fontSize;
    }

    @Override
    public String getText() {
        return text;
    }

    public void setText(final String text) {
        this.text = text;
    }

    @Override
    public float getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(final float maxLength) {
        this.maxLength = maxLength;
    }

}
