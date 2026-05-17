package es.timescope.rest.Proyectos.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProyectoNotFoundException extends ProyectoException {
  public ProyectoNotFoundException(Long id) { super("Proyecto con id " + id + " no encontrado"); }
}