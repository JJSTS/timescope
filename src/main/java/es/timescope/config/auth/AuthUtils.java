package es.timescope.config.auth;

import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class AuthUtils {

    public Usuario getUsuarioAuthentication(UsuariosRepository usuariosRepository) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return usuariosRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNotFound(username));
    }

    /** Comprueba si el caller tiene el rol indicado en el contexto actual (global o acotado a org). */
    public boolean callerHasRole(Roles rol) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol.name()));
    }

    /** Devuelve el rol activo del caller (global o acotado a org). Null si no hay autenticación. */
    public Roles getCallerRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .flatMap(name -> Arrays.stream(Roles.values()).filter(r -> r.name().equals(name)))
                .findFirst()
                .orElse(null);
    }

    /** Devuelve el orgId embebido en el JWT activo, o null si no hay org activa. */
    public Long getCallerOrgId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object details = auth.getDetails();
        return (details instanceof Long) ? (Long) details : null;
    }
}
