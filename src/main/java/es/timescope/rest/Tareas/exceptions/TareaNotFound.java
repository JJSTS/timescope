package es.timescope.rest.Tareas.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class TareaNotFound extends TareaException {
    public TareaNotFound(String message) {
        super(message);
    }

    public TareaNotFound(Long id) {
        super("Tarea con id " + id + " no encontrada");
    }
}

