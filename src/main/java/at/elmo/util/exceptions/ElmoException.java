package at.elmo.util.exceptions;

public class ElmoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ElmoException() {
        super();
    }

    public ElmoException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public ElmoException(String message, Throwable cause) {
        super(message, cause);
    }

    public ElmoException(String message) {
        super(message);
    }

    public ElmoException(Throwable cause) {
        super(cause);
    }

}
