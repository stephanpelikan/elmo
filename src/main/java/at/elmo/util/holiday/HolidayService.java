package at.elmo.util.holiday;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;

/**
 * This service can be used to calculate periods of business days.
 * <p>
 * Every official holiday, regional holiday, Saturday, Sunday is
 * a non business day and the 24th and 31th of December as well.
 */
public interface HolidayService {

	boolean isHoliday();
	
    boolean isHoliday(Calendar date);

    boolean isHoliday(LocalDate date);

    boolean isHoliday(LocalDateTime date);
    
    boolean isHoliday(String country, Calendar date);

    boolean isHoliday(String country, LocalDate date);

    boolean isHoliday(String country, LocalDateTime date);

    /**
     * The next business day. May return the given date if it is a business day.
     * 
     * @param date
     *            The date where to start finding a business day
     * @return The next business day
     */
    Date getNextBusinessDay(Date date);

    Date getNextBusinessDay(String country, Date date);

    LocalDate getNextBusinessDay(LocalDate date);

    LocalDate getNextBusinessDay(String country, LocalDate date);

    LocalDate getNextBusinessDay(LocalDateTime date);

    LocalDate getNextBusinessDay(String country, LocalDateTime date);

    Date getPreviousBusinessDay(Date date);

    Date nthBusinessDaySince(Date since, int count);

    Date nthBusinessDaySinceNow(int count);

    Date nthBusinessDaySince(String country, Date since, int count);

    Date nthBusinessDaySinceNow(String country, int count);

}
