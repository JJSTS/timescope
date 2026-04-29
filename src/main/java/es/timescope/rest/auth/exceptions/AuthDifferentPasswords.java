package es.timescope.rest.auth.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class AuthDifferentPasswords extends RuntimeException {
  public AuthDifferentPasswords(String message) {
    super(message);
  }
}