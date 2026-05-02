package es.timescope.rest.Notificacion.exception;

public abstract class NotificacionException extends RuntimeException {
    public NotificacionException(String message) {
        super(message);
    }
}
