package es.timescope.rest.auth.services.authentication;

public interface PasswordResetService {
    void enviarCodigo(String username);
    void resetPassword(String username, String code, String newPassword, String passwordConfirm);
}
