        package es.timescope.rest.Emails.Impl;

import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.exceptions.EmailEmptyOrNull;
import es.timescope.rest.Emails.exceptions.EmailNotSent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Value("${mailtrap.api.token}")
    private String apiToken;

    @Value("${mailtrap.inbox.id}")
    private String inboxId;

    @Value("${app.mail.from:info@timescope.org}")
    private String fromEmail;

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        if (to == null || to.isEmpty()) {
            throw new EmailEmptyOrNull();
        }
        try {
            log.info("Enviando email a: {}", to);

            Map<String, Object> payload = Map.of(
                "from", Map.of("email", fromEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "text", body
            );

            RestClient.create()
                .post()
                .uri("https://sandbox.api.mailtrap.io/api/send/" + inboxId)
                .header("Authorization", "Bearer " + apiToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

            log.info("Email enviado correctamente a: {}", to);
        } catch (Exception e) {
            log.error("Error al enviar email a {}: {}", to, e.getMessage());
            throw new EmailNotSent("Error al enviar email: " + e.getMessage());
        }
    }
}
