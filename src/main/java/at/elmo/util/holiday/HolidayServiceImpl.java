package at.elmo.util.holiday;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.Calendar;
import java.util.Date;

import de.jollyday.HolidayCalendar;
import de.jollyday.HolidayManager;
import de.jollyday.HolidayType;
import de.jollyday.ManagerParameter;
import de.jollyday.ManagerParameters;

/**
 * Service which provides convenience methods for business day calculations.
 * 
 * @see http://jollyday.sourceforge.net/
 */
class HolidayServiceImpl implements HolidayService {

    private final HolidayCalendar defaultCalendar;

    private final String[] calendarArgs;
    
    /**
     * @param defaultCalendar The default calendar to be used
     * @param calendarArgs Used to set regions
     */
    public HolidayServiceImpl( final HolidayCalendar defaultCalendar, final String... calendarArgs ) {

        this.defaultCalendar = defaultCalendar;
        this.calendarArgs = calendarArgs;

    }

    private HolidayManager getHolidayManager( final String country ) {

        final HolidayCalendar calendar;
        if ( country == null ) {
            calendar = defaultCalendar;
        } else {
            calendar = getHolidayCalendar( country );
        }

        final ManagerParameter parameter = ManagerParameters.create( calendar );
        return HolidayManager.getInstance( parameter );

    }

    public static HolidayCalendar getHolidayCalendar( final String country ) {

        for ( final HolidayCalendar calendar : HolidayCalendar.values() ) {

            if ( calendar.getId().equals( country ) || calendar.name().equals( country ) ) {
                return calendar;
            }

        }

        throw new RuntimeException( "Unsupported HolidayCalendar '" + country
                + "'! Refer the list in de.jollyday.HolidayCalendar for valid ids." );

    }

    @Override
    public boolean isHoliday() {
    	
    	return isHoliday(LocalDate.now());
    	
    }
    
    public boolean isHoliday( final Calendar date ) {

        return isHoliday( null, date );

    }

    public boolean isHoliday( final LocalDate date ) {

        return isHoliday( null, date );

    }

    public boolean isHoliday( final LocalDateTime date ) {

        return isHoliday( null, date.toLocalDate() );

    }

    @Override
    public Date getNextBusinessDay(String country, Date date) {

        final Calendar calendar = Calendar.getInstance();
        if ( date != null ) {
            calendar.setTime( date );
        }

        while ( isHoliday(country, calendar) ) {
            calendar.add( Calendar.DAY_OF_MONTH, 1 );
        }

        return calendar.getTime();

    }

    @Override
    public LocalDate getNextBusinessDay( final String country, final LocalDateTime date ) {
    	
    	return getNextBusinessDay(country, date.toLocalDate());
    	
    }

    @Override
    public LocalDate getNextBusinessDay( final String country, final LocalDate date ) {

    	LocalDate checkDate = date;
        while (isHoliday( country, checkDate )) {
            checkDate = checkDate.plusDays(1);
        }

        return checkDate;

    }


    @Override
    public LocalDate getNextBusinessDay( final LocalDateTime date ) {

        return getNextBusinessDay( date.toLocalDate() );

    }

    @Override
    public LocalDate getNextBusinessDay( final LocalDate date ) {

        return getNextBusinessDay( null, date );

    }

    @Override
    public Date getNextBusinessDay( final Date date ) {

        return getNextBusinessDay( null, date );

    }

    @Override
    public boolean isHoliday( final String country, final Calendar date ) {

        final HolidayManager holidayManager = getHolidayManager( country );

        return holidayManager.isHoliday( date, HolidayType.OFFICIAL_HOLIDAY, calendarArgs )
                || ( date.get( Calendar.DAY_OF_WEEK ) == Calendar.SATURDAY )
                || ( date.get( Calendar.DAY_OF_WEEK ) == Calendar.SUNDAY )
                || ( date.get( Calendar.DAY_OF_MONTH) == 24 && date.get( Calendar.MONTH ) == 11) // Christmas
                || ( date.get( Calendar.DAY_OF_MONTH) == 31 && date.get( Calendar.MONTH ) == 11);// Silvester

    }

    @Override
    public boolean isHoliday( final String country, final LocalDateTime date ) {
    	
    	return isHoliday(country, date.toLocalDate());
    	
    }

    @Override
    public boolean isHoliday( final String country, final LocalDate date ) {

        final HolidayManager holidayManager = getHolidayManager( country );

        return holidayManager.isHoliday( date, HolidayType.OFFICIAL_HOLIDAY, calendarArgs )
                || ( date.getDayOfWeek() == DayOfWeek.SATURDAY )
                || ( date.getDayOfWeek() == DayOfWeek.SUNDAY )
                || ( date.getDayOfMonth() == 24 && date.getMonth() == Month.DECEMBER ) // Christmas
                || ( date.getDayOfMonth() == 31 && date.getMonth() == Month.DECEMBER );// Silvester

    }

    @Override
    public Date nthBusinessDaySinceNow( int count ) {
        return nthBusinessDaySince( null, count );

    }

    @Override
    public Date nthBusinessDaySinceNow( String country, int count ) {

        return nthBusinessDaySince( country, null, count );

    }

    @Override
    public Date nthBusinessDaySince( Date since, int count ) {

        return nthBusinessDaySince( null, since, count );

    }

    @Override
    public Date nthBusinessDaySince( String country, Date since, int count ) {

        final Calendar calendar = Calendar.getInstance();
        if ( since != null ) {
            calendar.setTime( since );
        } else {
            since = calendar.getTime();
        }

        if ( count == 0 ) {
            return since;
        }

        calendar.add( Calendar.DAY_OF_MONTH, 1 );
        final Date nextBusinessDay = getNextBusinessDay( country, calendar.getTime() );

        return nthBusinessDaySince( country, nextBusinessDay, count - 1 );

    }

    @Override
    public Date getPreviousBusinessDay(Date date) {
        return getPreviousBusinessDay( null, date );
    }
    
    public Date getPreviousBusinessDay( final String country, final Date date ) {

        final Calendar calendar = Calendar.getInstance();
        if ( date != null ) {
            calendar.setTime( date );
        }

        while ( isHoliday( country, calendar )) {
            calendar.add( Calendar.DAY_OF_MONTH, -1 );
        }

        return calendar.getTime();

    }

}
