package es.timescope.rest.Solicitud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmisorAndReceptorEquals extends SolicitudException {
    public EmisorAndReceptorEquals() {
        super("No puedes enviarte solicitud a tí mismo");
    }
}
