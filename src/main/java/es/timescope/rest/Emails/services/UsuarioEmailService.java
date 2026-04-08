package es.timescope.rest.Emails.services;

import es.timescope.rest.Usuarios.models.Usuario;

public interface UsuarioEmailService {
    void enviarConfirmacionCreacion(Usuario usuario);
}
