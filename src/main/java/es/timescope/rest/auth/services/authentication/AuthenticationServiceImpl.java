package es.timescope.rest.auth.services.authentication;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Emails.services.EmailService;
import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Organizaciones.repositories.OrganizacionesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.models.UsuarioOrgRol;
import es.timescope.rest.Usuarios.repositories.UsuarioOrgRolRepository;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import es.timescope.rest.auth.dto.ChangePasswordDto;
import es.timescope.rest.auth.dto.JwtAuthResponse;
import es.timescope.rest.auth.dto.UserSignInRequest;
import es.timescope.rest.auth.dto.UserSignUpRequest;
import es.timescope.rest.auth.exceptions.AuthDifferentPasswords;
import es.timescope.rest.auth.exceptions.AuthExistingUsernameOrEmail;
import es.timescope.rest.auth.exceptions.AuthSignInNotValid;
import es.timescope.rest.auth.exceptions.PasswordException;
import es.timescope.rest.auth.repositories.AuthUsersRepository;
import es.timescope.rest.auth.services.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.authentication.BadCredentialsException;


@Slf4j
@RequiredArgsConstructor
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
  private final AuthUsersRepository authUsersRepository;
  private final OrganizacionesRepository organizacionesRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final UsuarioEmailService usuarioEmailService;
  private final AuthUtils authUtils;
  private final UsuariosRepository usuariosRepository;
  private final UsuarioOrgRolRepository usuarioOrgRolRepository;

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
          .rol(Roles.DESARROLLADOR)
          .build();
      try {
        var userStored = authUsersRepository.save(user);
        Long orgIdCreada = null;

        // Si el usuario quiere crear una organización
        if (request.getOrganizacion() != null && request.getOrganizacion().getNombre() != null &&
            !request.getOrganizacion().getNombre().isBlank()) {
          log.info("Creando organización: {}", request.getOrganizacion().getNombre());

          Organizacion org = Organizacion.builder()
              .nombre(request.getOrganizacion().getNombre())
              .admin(userStored)
              .build();
          org.getDirectores().add(userStored);

          Organizacion orgCreated = organizacionesRepository.save(org);
          userStored.setOrganizacion(orgCreated);
          authUsersRepository.save(userStored);

          // Rol DIRECTOR acotado a esta organización
          usuarioOrgRolRepository.save(UsuarioOrgRol.builder()
              .usuario(userStored)
              .organizacion(orgCreated)
              .rol(Roles.DIRECTOR)
              .build());

          orgIdCreada = orgCreated.getId();
          log.info("Organización creada con ID: {}, admin: {}", orgIdCreada, userStored.getUsername());
        }

        usuarioEmailService.enviarConfirmacionCreacion(request);
        String token = orgIdCreada != null
            ? jwtService.generateToken(userStored, orgIdCreada)
            : jwtService.generateToken(userStored);
        return JwtAuthResponse.builder().token(token).orgId(orgIdCreada).build();
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
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
    } catch (BadCredentialsException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
    }
    var user = authUsersRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new AuthSignInNotValid("Usuario o contraseña incorrectos"));

    Long orgId = null;
    if (request.getOrgNombre() != null && !request.getOrgNombre().isBlank()) {
      Organizacion org = organizacionesRepository.findByNombreIgnoreCase(request.getOrgNombre())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
              "Organización '" + request.getOrgNombre() + "' no encontrada"));
      if (user.getOrganizacion() == null || !user.getOrganizacion().getId().equals(org.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
            "No perteneces a la organización '" + request.getOrgNombre() + "'");
      }
      orgId = org.getId();
    }

    String jwt = orgId != null
        ? jwtService.generateToken(user, orgId)
        : jwtService.generateToken(user);

    return JwtAuthResponse.builder().token(jwt).orgId(orgId).build();
  }

  @Override
  public void cambiarPassword(ChangePasswordDto changePasswordDto) {
    Usuario usuario = authUtils.getUsuarioAuthentication(usuariosRepository);

    if (!passwordEncoder.matches(changePasswordDto.getPassword(), usuario.getPassword())) {
        throw new PasswordException("La contraseña actual no es correcta");
    }

    if (!changePasswordDto.getNewPassword().equals(changePasswordDto.getPasswordComprobacion())) {
        throw new PasswordException("Las contraseñas no coinciden");
    }

    usuario.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
    authUsersRepository.save(usuario);
    usuarioEmailService.enviarCambioContrasenia(usuario);
    log.info("Contraseña cambiada para el usuario: {}", usuario.getUsername());
  }
}
