package at.elmo.util.pos;

import org.apache.poi.ss.formula.FormulaParseException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.Hyperlink;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellAddress;
import org.apache.poi.ss.util.CellRangeAddress;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;

public class NullableCell implements Cell {

    private Cell cell;

    private NullableCell(
            final Cell cell) {
        this.cell = cell;
    }

    public static NullableCell from(
            final Cell cell) {
        return new NullableCell(cell);
    }

    public boolean isNull() {
        return cell == null;
    }

    @Override
    public CellAddress getAddress() {
        if (cell == null) {
            return null;
        }
        return cell.getAddress();
    }

    @Override
    public int getColumnIndex() {
        if (cell == null) {
            return -1;
        }
        return cell.getColumnIndex();
    }

    @Override
    public int getRowIndex() {
        if (cell == null) {
            return -1;
        }
        return cell.getRowIndex();
    }

    @Override
    public Sheet getSheet() {
        if (cell == null) {
            return null;
        }
        return cell.getSheet();
    }

    @Override
    public Row getRow() {
        if (cell == null) {
            return null;
        }
        return cell.getRow();
    }

    @Override
    @Deprecated
    public void setCellType(CellType cellType) {
        if (cell == null) {
            return;
        }
        cell.setCellType(cellType);
    }

    @Override
    public void setBlank() {
        if (cell == null) {
            return;
        }
        cell.setBlank();
    }

    @Override
    public CellType getCellType() {
        if (cell == null) {
            return null;
        }
        return cell.getCellType();
    }

    @Override
    public CellType getCachedFormulaResultType() {
        if (cell == null) {
            return null;
        }
        return cell.getCachedFormulaResultType();
    }

    @Override
    public void setCellValue(double value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(Date value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(LocalDateTime value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(LocalDate value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(Calendar value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(RichTextString value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellValue(String value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellFormula(String formula) throws FormulaParseException, IllegalStateException {
        if (cell == null) {
            return;
        }
        cell.setCellFormula(formula);
    }

    @Override
    public void removeFormula() throws IllegalStateException {
        if (cell == null) {
            return;
        }
        cell.removeFormula();
    }

    @Override
    public String getCellFormula() {
        if (cell == null) {
            return null;
        }
        return cell.getCellFormula();
    }

    @Override
    public double getNumericCellValue() {
        if (cell == null) {
            return -1;
        }
        return cell.getNumericCellValue();
    }

    @Override
    public Date getDateCellValue() {
        if (cell == null) {
            return null;
        }
        return cell.getDateCellValue();
    }

    @Override
    public LocalDateTime getLocalDateTimeCellValue() {
        if (cell == null) {
            return null;
        }
        return cell.getLocalDateTimeCellValue();
    }

    @Override
    public RichTextString getRichStringCellValue() {
        if (cell == null) {
            return null;
        }
        return cell.getRichStringCellValue();
    }

    @Override
    public String getStringCellValue() {
        if (cell == null) {
            return null;
        }
        return cell.getStringCellValue();
    }

    @Override
    public void setCellValue(boolean value) {
        if (cell == null) {
            return;
        }
        cell.setCellValue(value);
    }

    @Override
    public void setCellErrorValue(byte value) {
        if (cell == null) {
            return;
        }
        cell.setCellErrorValue(value);
    }

    @Override
    public boolean getBooleanCellValue() {
        if (cell == null) {
            return false;
        }
        return cell.getBooleanCellValue();
    }

    @Override
    public byte getErrorCellValue() {
        if (cell == null) {
            return -1;
        }
        return cell.getErrorCellValue();
    }

    @Override
    public void setCellStyle(CellStyle style) {
        if (cell == null) {
            return;
        }
        cell.setCellStyle(style);
    }

    @Override
    public CellStyle getCellStyle() {
        if (cell == null) {
            return null;
        }
        return cell.getCellStyle();
    }

    @Override
    public void setAsActiveCell() {
        if (cell == null) {
            return;
        }
        cell.setAsActiveCell();
    }

    @Override
    public void setCellComment(Comment comment) {
        if (cell == null) {
            return;
        }
        cell.setCellComment(comment);
    }

    @Override
    public Comment getCellComment() {
        if (cell == null) {
            return null;
        }
        return cell.getCellComment();
    }

    @Override
    public void removeCellComment() {
        if (cell == null) {
            return;
        }
        cell.removeCellComment();
    }

    @Override
    public Hyperlink getHyperlink() {
        if (cell == null) {
            return null;
        }
        return cell.getHyperlink();
    }

    @Override
    public void setHyperlink(Hyperlink link) {
        if (cell == null) {
            return;
        }
        cell.setHyperlink(link);
    }

    @Override
    public void removeHyperlink() {
        if (cell == null) {
            return;
        }
        cell.removeHyperlink();
    }

    @Override
    public CellRangeAddress getArrayFormulaRange() {
        if (cell == null) {
            return null;
        }
        return cell.getArrayFormulaRange();
    }

    @Override
    public boolean isPartOfArrayFormulaGroup() {
        if (cell == null) {
            return false;
        }
        return cell.isPartOfArrayFormulaGroup();
    }

}
