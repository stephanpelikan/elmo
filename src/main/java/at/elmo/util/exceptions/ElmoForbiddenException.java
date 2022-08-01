package at.elmo.util.exceptions;

public class ElmoForbiddenException extends ElmoException {

    private static final long serialVersionUID = 1L;

    public ElmoForbiddenException() {
        super();
    }

    public ElmoForbiddenException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public ElmoForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }

    public ElmoForbiddenException(String message) {
        super(message);
    }

    public ElmoForbiddenException(Throwable cause) {
        super(cause);
    }

}
