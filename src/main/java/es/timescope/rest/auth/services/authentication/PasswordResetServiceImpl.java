package es.timescope.rest.auth.services.authentication;

import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.auth.repositories.AuthUsersRepository;
import es.timescope.rest.Usuarios.models.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final AuthUsersRepository authUsersRepository;
    private final UsuarioEmailService usuarioEmailService;
    private final PasswordEncoder passwordEncoder;

    private record ResetEntry(String code, LocalDateTime expiresAt) {
        boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
    }

    private final ConcurrentHashMap<String, ResetEntry> codes = new ConcurrentHashMap<>();

    @Override
    public void enviarCodigo(String username) {
        Usuario user = authUsersRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe ningún usuario con ese nombre de usuario"));

        String code = String.format("%06d", new Random().nextInt(1_000_000));

        try {
            usuarioEmailService.enviarCodigoRecuperacion(user.getEmail(), user.getNombres(), code);
        } catch (Exception e) {
            log.error("No se pudo enviar el email de recuperación a {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo enviar el correo de recuperación. Inténtalo de nuevo más tarde.");
        }

        codes.put(username, new ResetEntry(code, LocalDateTime.now().plusMinutes(15)));
        log.info("Código de recuperación enviado al usuario: {}", username);
    }

    @Override
    public void resetPassword(String username, String code, String newPassword, String passwordConfirm) {
        ResetEntry entry = codes.get(username);

        if (entry == null || entry.isExpired()) {
            codes.remove(username);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El código ha expirado o no es válido. Solicita uno nuevo.");
        }
        if (!entry.code().equals(code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código introducido es incorrecto.");
        }
        if (!newPassword.equals(passwordConfirm)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las contraseñas no coinciden.");
        }
        if (newPassword.length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener al menos 5 caracteres.");
        }

        Usuario user = authUsersRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        authUsersRepository.save(user);
        codes.remove(username);
        log.info("Contraseña restablecida para el usuario: {}", username);
    }
}
