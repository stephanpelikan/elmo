package at.elmo.util.exceptions;

import java.util.Map;

public class ElmoValidationException extends ElmoException {

    private static final long serialVersionUID = 1L;

    private Map<String, String> violations;
    
    public ElmoValidationException(
            final String field,
            final String userMessage) {

        super(field + ": " + userMessage);
        violations = Map.of(field, userMessage);
        
    }

    public ElmoValidationException(
            final String field,
            final String userMessage,
            final Throwable cause) {

        super(cause);
        violations = Map.of(field, userMessage);
        
    }

    public ElmoValidationException(
            final Map<String, String> violations) {

        super(violations.toString());
        this.violations = violations;
        
    }

    public ElmoValidationException(
            final Map<String, String> violations,
            final Throwable cause) {

        super(cause);
        this.violations = violations;
        
    }

    public Map<String, String> getViolations() {
        
        return violations;
        
    }
    
}
