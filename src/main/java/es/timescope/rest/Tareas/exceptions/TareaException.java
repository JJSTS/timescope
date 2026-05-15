package es.timescope.rest.Tareas.exceptions;

public abstract class TareaException extends RuntimeException {
    public TareaException(String message) {
        super(message);
    }
}

