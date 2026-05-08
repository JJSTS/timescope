package es.timescope.config.auth;

import es.timescope.rest.Usuarios.models.UsuarioOrgRol;
import es.timescope.rest.Usuarios.repositories.UsuarioOrgRolRepository;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.auth.services.jwt.JwtService;
import es.timescope.rest.auth.services.users.AuthUsersService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final AuthUsersService authUsersService;
  private final UsuarioOrgRolRepository usuarioOrgRolRepository;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    return path.startsWith("/h2-console");
  }

  @Override
  protected void doFilterInternal(@NonNull HttpServletRequest request,
                                  @NonNull HttpServletResponse response,
                                  @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    log.info("Iniciando el filtro de autenticación");
    final String authHeader = request.getHeader("Authorization");
    final String jwt;
    UserDetails userDetails = null;
    String userName = null;

    if (!StringUtils.hasText(authHeader) || !StringUtils.startsWithIgnoreCase(authHeader, "Bearer ")) {
      log.info("No se ha encontrado cabecera de autenticación, se ignora");
      filterChain.doFilter(request, response);
      return;
    }

    log.info("Se ha encontrado cabecera de autenticación, se procesa");
    jwt = authHeader.substring(7);
    try {
      userName = jwtService.extractUserName(jwt);
    } catch (Exception e) {
      log.info("Token no válido");
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token no autorizado o no válido");
      return;
    }

    log.info("Usuario autenticado: {}", userName);
    if (StringUtils.hasText(userName)
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      log.info("Comprobando usuario y token");
      try {
        userDetails = authUsersService.loadUserByUsername(userName);
      } catch (Exception e) {
        log.info("Usuario no encontrado: {}", userName);
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Usuario no autorizado");
        return;
      }

      if (jwtService.isTokenValid(jwt, userDetails)) {
        log.info("JWT válido");

        Long orgId = jwtService.extractOrgId(jwt);
        Collection<? extends GrantedAuthority> authorities;

        if (orgId != null && userDetails instanceof Usuario usuario) {
          // Roles acotados a la organización activa
          List<UsuarioOrgRol> orgRoles = usuarioOrgRolRepository
              .findByUsuarioIdAndOrganizacionId(usuario.getId(), orgId);
          authorities = orgRoles.stream()
              .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRol().name()))
              .collect(Collectors.toList());
          log.info("Roles de org {}: {}", orgId, authorities);
        } else {
          // Sin orgId en el token: usa los roles globales del usuario
          authorities = userDetails.getAuthorities();
          log.info("Roles globales: {}", authorities);
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails, null, authorities);
        authToken.setDetails(orgId);
        context.setAuthentication(authToken);
        SecurityContextHolder.setContext(context);
      }
    }
    filterChain.doFilter(request, response);
  }
}
