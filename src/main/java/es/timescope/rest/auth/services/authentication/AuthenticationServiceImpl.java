package es.timescope.rest.auth.services.authentication;

import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.auth.dto.JwtAuthResponse;
import es.timescope.rest.auth.dto.UserSignInRequest;
import es.timescope.rest.auth.dto.UserSignUpRequest;
import es.timescope.rest.auth.exceptions.AuthDifferentPasswords;
import es.timescope.rest.auth.exceptions.AuthExistingUsernameOrEmail;
import es.timescope.rest.auth.exceptions.AuthSignInNotValid;
import es.timescope.rest.auth.repositories.AuthUsersRepository;
import es.timescope.rest.auth.services.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
  private final AuthUsersRepository authUsersRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final UsuarioEmailService usuarioEmailService;

  @Override
  public JwtAuthResponse signUp(UserSignUpRequest request) {
    log.info("Creando usuario: {}", request);
    if (request.getPassword().contentEquals(request.getPasswordComprobacion())) {
      Usuario user = Usuario.builder()
          .username(request.getUsername())
          .password(passwordEncoder.encode(request.getPassword()))
          .email(request.getEmail())
          .nombres(request.getNombre())
          .apellidos(request.getApellidos())
          .roles(Stream.of(Roles.DESARROLLADOR).collect(Collectors.toSet()))
          .build();
      try {
        var userStored = authUsersRepository.save(user);
        usuarioEmailService.enviarConfirmacionCreacion(request);
        return JwtAuthResponse.builder().token(jwtService.generateToken(userStored)).build();
      } catch (DataIntegrityViolationException ex) {
        throw new AuthExistingUsernameOrEmail("El usuario con username " + request.getUsername() + " o email " + request.getEmail() + " ya existe");
      }
    } else {
      throw new AuthDifferentPasswords("Las contraseñas no coinciden");

    }
  }

  @Override
  public JwtAuthResponse signIn(UserSignInRequest request) {
    log.info("Autenticando usuario: {}", request);
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
    var user = authUsersRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new AuthSignInNotValid("Usuario o contraseña incorrectos"));
    var jwt = jwtService.generateToken(user);
    return JwtAuthResponse.builder().token(jwt).build();
  }
}
