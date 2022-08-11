package at.elmo.util.sms;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import at.elmo.config.ElmoProperties;
import at.elmo.config.FreemarkerConfiguration;
import at.elmo.util.sms.Sms.Status;
import freemarker.template.Configuration;

@Service
public class SmsService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+[1-9]{1,2}\\s?[1-9]{2}[0-9\\s]{6,14}$");

    @Autowired
    private Logger logger;

    @Autowired
    private SmsProperties properties;

    @Autowired
    private ElmoProperties elmoProperties;

    @Autowired
    @Qualifier(FreemarkerConfiguration.SMS_TEMPLATES)
    private Configuration templating;

    @Autowired
    private SmsRepository smses;

    public boolean isValidPhoneNumberFormat(
            final String phoneNumber) {
        
        if (phoneNumber == null) {
            return false;
        }
        return PHONE_PATTERN.matcher(phoneNumber).matches();

    }
    
    private String determineToNumber(
            final String toNumber) {

        return
                // don't redirect SMS (at production)?
                properties.getRedirectAllTo() == null
                // then use given to-number
                ? toNumber
                // redirect SMS (at development)?
                : properties.getDontRedirect().contains(toNumber)
                        // and given to-number is white-listed, then use it 
                        ? toNumber
                        // otherwise redirect SMS
                        : properties.getRedirectAllTo();

    }

    @Transactional
    public void sendSms(
            final String templatePath,
            final String fromName,
            final String fromNumber,
            final String toName,
            final String toNumber,
            final Object... context) throws Exception {
        
        final var content = processTemplate(templatePath + "/content.ftl", context);
        final var targetToNumber = determineToNumber(toNumber);
        
        final var sms = new Sms();
        sms.setId(UUID.randomUUID().toString());
        sms.setContent(content);
        sms.setRecipientName(toName);
        sms.setRecipientNumber(targetToNumber);
        sms.setSenderName(fromName);
        sms.setSenderNumber(fromNumber);
        sms.setStatus(Status.READY);
        smses.save(sms);

        logger.info("Sent SMS to {}", targetToNumber);
        
    }

    private String processTemplate(
            final String template,
            final Object ...context) throws Exception {

        final var templateContext = new HashMap<String, Object>();
        
        if (context != null) {
            
            // build context with e.g. 'member' -> Member
            Arrays
                    .stream(context)
                    .forEach(c -> templateContext.put(
                            c.getClass().getSimpleName().substring(0, 1).toLowerCase()
                                    + c.getClass().getSimpleName().substring(1),
                            c));
            
        }

        final var locale = Locale.forLanguageTag(elmoProperties.getDefaultLocale());

        return FreeMarkerTemplateUtils.processTemplateIntoString(templating.getTemplate(template, locale),
                templateContext);

    }

}
