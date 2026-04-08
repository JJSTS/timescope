package es.timescope.rest.Emails.exceptions;

public abstract class EmailException extends RuntimeException {
    public EmailException(String message) {
        super(message);
    }
}
