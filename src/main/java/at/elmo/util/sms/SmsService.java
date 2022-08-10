package at.elmo.util.sms;

import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+[1-9]{1,2}\\s?[0-9\\s]{6,14}$");

    public boolean isValidPhoneNumberFormat(
            final String phoneNumber) {
        
        if (phoneNumber == null) {
            return false;
        }
        return PHONE_PATTERN.matcher(phoneNumber).matches();

    }

}
