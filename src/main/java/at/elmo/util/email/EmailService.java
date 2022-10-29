package at.elmo.util.email;

import at.elmo.config.ElmoProperties;
import at.elmo.config.FreemarkerConfiguration;
import freemarker.template.Configuration;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@]+@[^@]+$");
    
    @Autowired
    private Logger logger;

    @Autowired
    private ElmoProperties elmoProperties;

    @Autowired
    private EmailProperties properties;
    
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    @Qualifier(FreemarkerConfiguration.EMAIL_TEMPLATES)
    private Configuration templating;

    public boolean isValidEmailAddressFormat(
            final String email) {
        
        if (email == null) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();

    }

    public void sendEmail(
            final String templatePath,
            final String toAddress,
            final Object ...context) throws Exception {
        
        sendEmail(templatePath, List.of(toAddress), context);
        
    }

    public void sendEmail(
            final String templatePath,
            final Collection<String> toAddresses,
            final Object ...context) throws Exception {
        
        final var body = processTemplate(templatePath + "/body.ftlh", context);
        final var subject = processTemplate(templatePath + "/subject.ftl", context);
        final var targetToAddresses = toAddresses
                .stream()
                .map(this::determineToAddress)
                .toArray(size -> new String[size]);
        
        final var mimeMessage = mailSender.createMimeMessage();
        final var helper = new MimeMessageHelper(
                mimeMessage,
                true,
                StandardCharsets.UTF_8.name());
        
        helper.setFrom(properties.getSender());
        helper.setTo(targetToAddresses);
        helper.setSubject(subject);
        helper.setText(body, true);
        Arrays
                .stream(context)
                .filter(c -> c != null)
                .filter(c -> (c instanceof NamedObject))
                .map(c -> (NamedObject) c)
                .filter(c -> (c.getObject() instanceof File))
                .forEach(c -> {
                    try {
                        helper.addAttachment(c.getName(), (File) c.getObject());
                    } catch (Exception e) {
                        logger.error(
                                "Could not attach file '{}' to email '{}' sent to {}",
                                c.getName(),
                                templatePath,
                                String.join(", ", targetToAddresses),
                                e);
                    }
                });

        mailSender.send(mimeMessage);

        logger.info("Sent mail to '{}'", String.join(", ", targetToAddresses));

    }

    private String determineToAddress(
            final String toAddress) {

        return
                // don't redirect emails (at production)?
                properties.getRedirectAllTo() == null
                // then use given to-address
                ? toAddress
                // redirect emails (at development)?
                : properties.getDontRedirect().contains(toAddress)
                        // and given to-address is white-listed, then use it 
                        ? toAddress
                        // otherwise redirect email
                        : properties.getRedirectAllTo();

    }
    
    private String processTemplate(
            final String template,
            final Object ...context) throws Exception {
        
        final var templateContext = new HashMap<String, Object>();
        
        if (context != null) {
            
            // build context with e.g. 'member' -> Member
            Arrays
                    .stream(context)
                    .filter(c -> c != null)
                    .map(c -> NamedObject.from(c))
                    .filter(c -> !(c.getObject() instanceof File))
                    .forEach(c -> templateContext.put(c.getName(), c.getObject()));
            
        }

        final var locale = Locale.forLanguageTag(elmoProperties.getDefaultLocale());

        return FreeMarkerTemplateUtils
                .processTemplateIntoString(
                        templating.getTemplate(template, locale),
                        templateContext);
        
    }
    
}
