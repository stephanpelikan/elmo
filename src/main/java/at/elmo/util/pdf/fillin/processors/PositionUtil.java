package at.elmo.util.pdf.fillin.processors;

import java.awt.geom.Point2D;

import org.apache.pdfbox.pdmodel.common.PDRectangle;

import at.elmo.util.pdf.fillin.Unit;

public class PositionUtil {

    private static final int DEFAULT_USER_SPACE_UNIT_DPI = 72;

    private static final float MM_TO_UNITS = 1/(10*2.54f)*DEFAULT_USER_SPACE_UNIT_DPI;
	
    /**
     * Converts the given position to a point according the
     * given pdf-mediaBox. The point's origin is top/left.
     * 
     * @param mediaBox The pdf-mediaBox
	 * @param x The horizontal position
	 * @param y The vertical position
	 * @param unit The units of the given position
	 * @return The point
     */
	public static Point2D getPdfPosition(
			final PDRectangle mediaBox,
			final float x,
			final float y,
			final Unit unit) {
		
		final Point2D point = getPoint(x, y, unit);
		
		if (mediaBox != null) {
			
			/*
			 *  Points in PDFs are relative to the lower left corner of the media.
			 *  The given position is relative to the upper left corner since this
			 *  is more convenient to humans.
			 */
			final double newY =
					mediaBox.getLowerLeftY() + (mediaBox.getHeight() - point.getY());
			
			point.setLocation(
					point.getX(),
					newY);
			
		}
		
		return point;
		
	}
	
	public static float getPoint(final float value, final Unit unit) {
		
		// Millimeters
		if ((unit != null)
				&& unit.equals(Unit.MM)) {
		
			return mmToPoint(value);
			
		}
		// PDF-points (72 dots per inch)
		else {
			
			return value;
			
		}
		
	}
	
	/**
	 * Converts millimeters to PDF-points.
	 * 
	 * @param mm The value in millimeters
	 * @return The value in points
	 */
	public static float mmToPoint(final float mm) {

		return mm * MM_TO_UNITS;
		
	}

	/**
	 * Converts PDF-points to millimeters.
	 * 
	 * @param point The value in points
	 * @return The value in millimeters
	 */
	public static float pointToMM(final float point) {
		
		return point / MM_TO_UNITS;
		
	}
	
	/**
	 * Converts the given position to a point. The point's origin is top/left.
	 * 
	 * @param x The horizontal position
	 * @param y The vertical position
	 * @param unit The units of the given position
	 * @return The point
	 */
	private static Point2D getPoint(
			final float x,
			final float y,
			final Unit unit) {
		
		Point2D result = new Point2D.Float();
		
		result.setLocation(
				getPoint(x, unit),
				getPoint(y, unit));
		
		return result;
		
	}
	
}
