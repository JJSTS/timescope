package es.timescope.config.auth;

import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtils {
    public Usuario getUsuarioAuthentication(UsuariosRepository usuariosRepository) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return usuariosRepository.findByUsername(username).orElseThrow(() -> new UsuarioNotFound(username));
    };
}
