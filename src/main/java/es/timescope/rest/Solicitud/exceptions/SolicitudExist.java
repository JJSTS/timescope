package es.timescope.rest.Solicitud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SolicitudExist extends SolicitudException {
    public SolicitudExist() {
        super("Ya existe un solicitud pendiente");
    }
}
