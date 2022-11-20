package at.elmo.util.pdf.fillin.elements;

import at.elmo.util.pdf.fillin.Unit;

public interface FillInElement {

    int getPageNumber();
    
    float getHorizontalPosition();
    
    float getVerticalPosition();
    
    Unit getUnit();
    
}
