package es.timescope.rest.Emails.Impl;

import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Emails.exceptions.EmailNotSent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioEmailServiceImpl implements UsuarioEmailService {
    private final EmailService emailService;

    @Override
    public void enviarConfirmacionCreacion(Usuario usuario) {
        try{
            log.info("enviando confirmacion de creacion del usuario {} al correo {}", usuario.getUsername(), usuario.getEmail());
            String subject = "Confirmación de creacion";
            String body = "El usuario " + usuario.getUsername() + " ha sido creado correctamente =D";
            emailService.sendSimpleEmail(usuario.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Error al enviar el email al correo" + usuario.getEmail());
           throw new EmailNotSent("Error al enviar el email al correo" + usuario.getEmail());
        }
    }
}
