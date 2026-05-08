package es.timescope.rest.Emails.services;

import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.auth.dto.UserSignUpRequest;

public interface UsuarioEmailService {
    void enviarConfirmacionCreacion(UserSignUpRequest usuario);
    void enviarCambioContrasenia(Usuario usuario);
}
