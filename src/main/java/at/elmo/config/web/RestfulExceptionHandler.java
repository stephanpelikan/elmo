package at.elmo.config.web;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoForbiddenException;
import at.elmo.util.exceptions.ElmoUserMessageException;
import at.elmo.util.exceptions.ElmoValidationException;

@ControllerAdvice
public class RestfulExceptionHandler {

    public static class RestError {

        public int code;
    }

    @Autowired
    private Logger logger;

    @ExceptionHandler(ElmoValidationException.class)
    public ResponseEntity<Object> handleValidationException(
            final WebRequest request,
            final Exception exception) {
        
        logger.debug("Validation failed", exception);
        
        return ResponseEntity
                .badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(((ElmoValidationException) exception).getViolations());
        
    }

    @ExceptionHandler(ElmoUserMessageException.class)
    public ResponseEntity<String> handleUserMessageException(
            final HttpServletRequest request,
            final Exception exception) {
        
        logger.debug("Unprocessable entity", exception);
        
        return ResponseEntity
                .unprocessableEntity()
                .body(exception.getMessage());
        
    }

    @ExceptionHandler(ElmoForbiddenException.class)
    public ResponseEntity<String> handleForbiddenException(
            final HttpServletRequest request,
            final Exception exception) {
        
        logger.debug("Forbidden", exception);
        
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(exception.getMessage());
        
    }
    
    @ExceptionHandler(ElmoException.class)
    public ResponseEntity<String> handleUnexpectedException(
            final HttpServletRequest request,
            final Exception exception) {
        
        logger.debug("Unexpected exeception", exception);
        
        return ResponseEntity
                .internalServerError()
                .body(exception.getMessage());
        
    }

}
