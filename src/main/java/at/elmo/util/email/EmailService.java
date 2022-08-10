package at.elmo.util.email;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import at.elmo.config.ElmoProperties;
import at.elmo.config.FreemarkerConfiguration;
import freemarker.template.Configuration;

@Service
public class EmailService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@]+@[^@]+$");
    
    @Autowired
    private Logger logger;

    @Autowired
    private ElmoProperties properties;
    
    @Autowired
    private JavaMailSender mailSender;

    public boolean isValidEmailAddressFormat(
            final String email) {
        
        if (email == null) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();

    }
    
    @Autowired
    @Qualifier(FreemarkerConfiguration.EMAIL_TEMPLATES)
    private Configuration templating;

    public void sendEmail(
            final String templatePath,
            final String toAddress,
            final Object context) throws Exception {
        
        final var body = processTemplate("email/" + templatePath + "/body.ftlh", context);
        final var subject = processTemplate("email/" + templatePath + "/subject.ftl", context);
        final var targetToAddress = determineToAddress(toAddress);
        
        final var mimeMessage = mailSender.createMimeMessage();
        final var helper = new MimeMessageHelper(mimeMessage, StandardCharsets.UTF_8.name());
        
        helper.setFrom(properties.getEmailSender());
        helper.setTo(targetToAddress);
        helper.setSubject(subject);
        helper.setText(body, true);

        mailSender.send(mimeMessage);

        logger.info("Sent mail to '{}'", targetToAddress);

    }

    private String determineToAddress(
            final String toAddress) {

        return
                // don't redirect emails (at production)?
                properties.getRedirectAllEmailsToAddress() == null
                // then use given to-address
                ? toAddress
                // redirect emails (at development)?
                : properties.getDontRedirectEmailsToAddresses().contains(toAddress)
                        // and given to-address is white-listed, then use it 
                        ? toAddress
                        // otherwise redirect email
                        : properties.getRedirectAllEmailsToAddress();

    }
    
    private String processTemplate(
            final String template,
            final Object context) throws Exception {
        
        // build context with e.g. 'member' -> Member
        final var templateContext = Map.of(
                context.getClass().getSimpleName().substring(0, 1).toLowerCase()
                        + context.getClass().getSimpleName().substring(1),
                context);

        final var locale = Locale.forLanguageTag(properties.getDefaultLocale());

        return FreeMarkerTemplateUtils
                .processTemplateIntoString(
                        templating.getTemplate(template, locale),
                        templateContext);
        
    }
    
}
