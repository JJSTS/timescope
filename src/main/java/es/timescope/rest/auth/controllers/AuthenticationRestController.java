package es.timescope.rest.auth.controllers;

import es.timescope.rest.auth.dto.ChangePasswordDto;
import es.timescope.rest.auth.dto.JwtAuthResponse;
import es.timescope.rest.auth.dto.UserSignInRequest;
import es.timescope.rest.auth.dto.UserSignUpRequest;
import es.timescope.rest.auth.services.authentication.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/auth")
public class AuthenticationRestController {
  private final AuthenticationService authenticationService;

  @PostMapping("/signup")
  public ResponseEntity<JwtAuthResponse> signUp(@Valid @RequestBody UserSignUpRequest request) {
    log.info("Registrando usuario: {}", request);
    return ResponseEntity.ok(authenticationService.signUp(request));
  }

  @PostMapping("/signin")
  public ResponseEntity<JwtAuthResponse> signIn(@Valid @RequestBody UserSignInRequest request) {
    log.info("Iniciando sesión de usuario: {}", request);
    return ResponseEntity.ok(authenticationService.signIn(request));
  }

  @PatchMapping("/password")
  public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDto changePasswordDto) {
    authenticationService.cambiarPassword(changePasswordDto);
    return ResponseEntity.ok().build();
  }

  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidationExceptions(
      MethodArgumentNotValidException ex) {

    ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

    BindingResult result = ex.getBindingResult();
    problemDetail.setDetail("Falló la validación para el objeto='" + result.getObjectName()
        + "'. " + "Núm. errores: " + result.getErrorCount());

    Map<String, String> errores = new HashMap<>();
    result.getAllErrors().forEach((error) -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errores.put(fieldName, errorMessage);
    });

    problemDetail.setProperty("errores", errores);
    return problemDetail;
  }
}