package es.timescope.rest.Organizaciones.exceptions;

public abstract class OrganizacionException extends RuntimeException {
    public OrganizacionException(String message) {
        super(message);
    }
}