package es.timescope.rest.Tareas.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TareaCreateException extends TareaException {
    public TareaCreateException(String message) {
        super(message);
    }
}

