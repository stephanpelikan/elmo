package at.elmo.config.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.concurrent.TimeUnit;

/**
 * @see https://medium.com/@kshep92/single-page-applications-with-spring-boot-b64d8d37015d
 */
@ConditionalOnProperty(prefix = "spring", name = "application.spa-default-file")
@ControllerAdvice
public class SpaNoHandlerFoundExceptionHandler {

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${spring.application.spa-default-file}")
    private String defaultFile;

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Resource> renderDefaultPage(final NoHandlerFoundException exception) {

        final var hasExtension = exception.getRequestURL().lastIndexOf('.') > exception.getRequestURL().lastIndexOf('/');
        final var uri = "classpath:/static"
                + exception.getRequestURL()
                + (hasExtension ? "" : ".html");
        var resource = resourceLoader.getResource(uri);
        if (!resource.exists()) {
            resource = resourceLoader.getResource(defaultFile);
        }
        final var filename = resource.getFilename();
        final var posOfExtension = filename.lastIndexOf('.');
        final String contentType;
        if (posOfExtension != -1) {
            final var extension = filename.substring(posOfExtension + 1);
            contentType = MimeMappings.DEFAULT.get(extension);
        } else {
            contentType = "text/html";
        }
        return ResponseEntity
                .ok()
                .header("Content-Type", contentType)
                .cacheControl(CacheControl.maxAge(0, TimeUnit.SECONDS))
                .body(resource);

    }

}
