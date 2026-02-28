package es.timescope.rest.Proyectos.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ProyectoBadRequestException extends ProyectoException {
  public ProyectoBadRequestException(String message) {
    super(message);
  }
}
