package at.elmo.config.web;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import at.elmo.util.ElmoException;

@ControllerAdvice
public class RestfulExceptionHandler {

    @Autowired
    private Logger logger;
    
    @ExceptionHandler(ElmoException.class)
    public ResponseEntity<String> handleValidationException(
            final HttpServletRequest request,
            final Exception exception) {
        
        logger.debug("Unprocessable entity", exception);
        
        return ResponseEntity.unprocessableEntity().body(exception.getMessage());
        
    }

}
