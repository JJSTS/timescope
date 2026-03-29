package es.timescope.rest.Emails.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender, @Value("${app.mail.from:pruebapruebasdaw2026@gmail.com}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            log.info("Enviando email simple a: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email simple enviado correctamente a: {}", to);
        } catch (Exception e) {
            log.error("Error al enviar email simple: {}", e.getMessage());
        }
    }
}
