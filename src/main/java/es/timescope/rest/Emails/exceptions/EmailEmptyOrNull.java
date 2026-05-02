package es.timescope.rest.Emails.exceptions;

public class EmailEmptyOrNull extends EmailException {
    public EmailEmptyOrNull() {
        super("El destinatario no puede estar vacío");
    }
}
