package es.timescope.rest.Emails.Impl;

import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.Emails.exceptions.EmailNotSent;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import es.timescope.rest.auth.dto.ChangePasswordDto;
import es.timescope.rest.auth.dto.UserSignInRequest;
import es.timescope.rest.auth.dto.UserSignUpRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioEmailServiceImpl implements UsuarioEmailService {
    private final EmailService emailService;

    @Value("${rutaFront:https://timescope-jjsts-projects.vercel.app}")
    private String url;

    @Override
    public void enviarConfirmacionCreacion(UserSignUpRequest usuario) {
        log.info("enviando confirmacion de creacion del usuario {} al correo {}", usuario.getUsername(), usuario.getEmail());
        String subject = "¡Bienvenido a TimeScope!";
        String body = String.format("""
                        Hola %s,

                        ¡Tu usuario '%s' ha sido creado correctamente en TimeScope!

                        Ya puedes acceder a la plataforma con tus credenciales.

                        Gracias por unirte a nuestro equipo.

                        Puedes ver tu perfil en el siguiente enlace: %s

                        Saludos,
                        El equipo de TimeScope
                        """,
                usuario.getNombre(),
                usuario.getUsername(),
                url
        );
        emailService.sendSimpleEmail(usuario.getEmail(), subject, body);
    }

    @Override
    public void enviarCodigoRecuperacion(String email, String nombre, String code) {
        log.info("Enviando código de recuperación a: {}", email);
        String subject = "Código de recuperación de contraseña — TimeScope";
        String body = String.format("""
                        Hola %s,

                        Has solicitado restablecer tu contraseña en TimeScope.

                        Tu código de verificación es:

                              %s

                        Este código es válido durante 15 minutos.

                        Si no has solicitado este cambio, puedes ignorar este email.

                        Saludos,
                        El equipo de TimeScope
                        """,
                nombre, code
        );
        emailService.sendSimpleEmail(email, subject, body);
    }

    @Override
    public void enviarCambioContrasenia(Usuario usuario) {
        log.info("Enviando notificación de cambio de contraseña a: {}", usuario.getEmail());
        String subject = "Tu contraseña en TimeScope ha sido cambiada";
        String body = String.format("""
                        Hola %s,

                        Te notificamos que tu contraseña ha sido actualizada correctamente.

                        Si realizaste este cambio, puedes ignorar este email.

                        Si NO realizaste este cambio, por favor accede inmediatamente a tu cuenta y cambia tu contraseña.

                        Saludos,
                        El equipo de TimeScope
                        """,
                usuario.getNombres()
        );
        emailService.sendSimpleEmail(usuario.getEmail(), subject, body);
    }
}
