package es.timescope.rest.Usuarios.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UsuarioNombreOrEmailExists extends UsuarioException {
    public UsuarioNombreOrEmailExists(String message) {
        super(message);
    }
}
