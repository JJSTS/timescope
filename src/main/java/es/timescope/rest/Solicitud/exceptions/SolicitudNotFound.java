package es.timescope.rest.Solicitud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SolicitudNotFound extends SolicitudException {
    public SolicitudNotFound() {
        super("Solicitud no encontrada");
    }
}
