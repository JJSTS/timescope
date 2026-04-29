package es.timescope.rest.auth.services.users;

import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.auth.repositories.AuthUsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service("userDetailsService")
public class AuthUsersServiceImpl implements AuthUsersService {

  private final AuthUsersRepository authUsersRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsuarioNotFound {
    return authUsersRepository.findByUsername(username)
        .orElseThrow(() -> new UsuarioNotFound("Usuario con username " + username + " no encontrado"));
  }
}
