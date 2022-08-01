package at.elmo.util.exceptions;

public class ElmoUserMessageException extends ElmoException {

    private static final long serialVersionUID = 1L;

    public ElmoUserMessageException() {
        super();
    }

    public ElmoUserMessageException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public ElmoUserMessageException(String message, Throwable cause) {
        super(message, cause);
    }

    public ElmoUserMessageException(String message) {
        super(message);
    }

    public ElmoUserMessageException(Throwable cause) {
        super(cause);
    }

}
