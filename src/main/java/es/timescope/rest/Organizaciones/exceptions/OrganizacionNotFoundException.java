package es.timescope.rest.Organizaciones.exceptions;

public class OrganizacionNotFoundException extends OrganizacionException {
    public OrganizacionNotFoundException(Long id) {
        super("Organización no encontrada con id: " + id);
    }
}