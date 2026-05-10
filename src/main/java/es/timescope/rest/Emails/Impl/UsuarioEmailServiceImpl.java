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
    private final UsuariosRepository usuariosRepository;

    @Value("${URL:http://localhost:3000/dashboard}")
    private String url;

    @Override
    public void enviarConfirmacionCreacion(UserSignUpRequest usuario) {
        try{
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
        } catch (Exception e) {
            log.error("Error al enviar el email al correo {}: {}", usuario.getEmail(), e.getMessage());
        }
    }

    @Override
    public void enviarCambioContrasenia(Usuario usuario) {
        try{
            log.info("¡Se ha cambiado la contraseña correctamente!");
            String subject = "Tu contraseña en TimeScope ha sido cambiada";
            String body = String.format("""
                            Te notificamos que tu contraseña ha sido actualizada correctamente.
                            
                            Si realizaste este cambio, puedes ignorar este email.
                            
                            ⚠️ Si NO realizaste este cambio, por favor:
                            1. Accede inmediatamente a tu cuenta
                            2. Cambia tu contraseña nuevamente
                            3. Contacta con nuestro equipo de soporte: soporte@timescope.org
                            
                            Si tienes dudas, no dudes en contactarnos.
                            
                            Saludos,
                            El equipo de TimeScope
                            """
            );
            emailService.sendSimpleEmail(usuario.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Error al enviar el email de cambio de contraseña: {}", e.getMessage());
        }
    }
}
