package es.timescope.rest.Emails.services;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String text);
}
