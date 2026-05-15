package es.timescope.rest.auth.services.jwt;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
  String extractUserName(String token);

  String generateToken(UserDetails userDetails);

  String generateToken(UserDetails userDetails, Long orgId);

  Long extractOrgId(String token);

  boolean isTokenValid(String token, UserDetails userDetails);
}
