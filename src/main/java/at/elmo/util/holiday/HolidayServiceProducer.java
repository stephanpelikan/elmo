package at.elmo.util.holiday;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.jollyday.HolidayCalendar;

/**
 * Produces the holiday service
 * 
 * @see HolidayService
 */
@Configuration
public class HolidayServiceProducer {

    @Value("${holiday.country:AUSTRIA}")
    private String defaultCountryStr;

    @Value("${holiday.sub-country:AUSTRIA}")
    private String defaultSubCountryStr;

    @Bean("HolidayService")
    public HolidayService buildHolidayService() {
        
        final HolidayCalendar defaultCalendar = HolidayServiceImpl.getHolidayCalendar(defaultCountryStr);
        return new HolidayServiceImpl(defaultCalendar, defaultSubCountryStr);
        
    }
    
}