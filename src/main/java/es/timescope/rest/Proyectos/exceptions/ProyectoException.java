package es.timescope.rest.Proyectos.exceptions;

public abstract class ProyectoException extends RuntimeException {
  public ProyectoException(String message) {
    super(message);
  }
}
