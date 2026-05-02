package es.timescope.rest.Emails.Impl;

import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.exceptions.EmailEmptyOrNull;
import es.timescope.rest.Emails.exceptions.EmailNotSent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:pruebapruebasdaw2026@gmail.com}")
    private String fromEmail;

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        if (to == null || to.isEmpty()) {
            throw new EmailEmptyOrNull();
        }
        try {
            log.info("Enviando email simple a: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email simple enviado correctamente a: {}", to);
        } catch (MailException e) {
            log.error("Error al enviar email a {}: {}", to, e.getMessage());
            throw new EmailNotSent("Error al enviar email simple: " + e.getMessage());
        }
    }
}
