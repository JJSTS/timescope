package es.timescope.rest.auth.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PasswordException extends AuthException {
    public PasswordException(String message) {
        super(message);
    }
}
