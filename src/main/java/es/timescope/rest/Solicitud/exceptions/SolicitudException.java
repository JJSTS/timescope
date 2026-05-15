package es.timescope.rest.Solicitud.exceptions;

public abstract class SolicitudException extends RuntimeException {
    public SolicitudException(String message) {
        super(message);
    }
}
