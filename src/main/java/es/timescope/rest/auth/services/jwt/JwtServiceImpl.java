package es.timescope.rest.auth.services.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtServiceImpl implements JwtService {
  @Value("${jwt.secret}")
  private String jwtSigningKey;

  @Value("${jwt.expiration}")
  private Long jwtExpiration;

  @Override
  public String extractUserName(String token) {
    log.info("Extracting username from token " + token);
    return extractClaim(token, DecodedJWT::getSubject);
  }

  @Override
  public String generateToken(UserDetails userDetails) {
    log.info("Generating token for user " + userDetails.getUsername());
    return generateToken(new HashMap<>(), userDetails, null);
  }

  @Override
  public String generateToken(UserDetails userDetails, Long orgId) {
    log.info("Generating token for user {} with orgId {}", userDetails.getUsername(), orgId);
    return generateToken(new HashMap<>(), userDetails, orgId);
  }

  @Override
  public Long extractOrgId(String token) {
    try {
      return JWT.decode(token).getClaim("orgId").asLong();
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public boolean isTokenValid(String token, UserDetails userDetails) {
    log.info("Validating token " + token + " for user " + userDetails.getUsername());
    final String userName = extractUserName(token);
    return (userName.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  private <T> T extractClaim(String token, Function<DecodedJWT, T> claimsResolvers) {
    log.info("Extracting claim from token " + token);
    final DecodedJWT decodedJWT = JWT.decode(token);
    return claimsResolvers.apply(decodedJWT);
  }

  private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, Long orgId) {
    Algorithm algorithm = Algorithm.HMAC512(getSigningKey());
    Date now = new Date();
    Date expirationDate = new Date(now.getTime() + (1000 * jwtExpiration));

    var builder = JWT.create()
        .withHeader(createHeader())
        .withSubject(userDetails.getUsername())
        .withIssuedAt(now)
        .withExpiresAt(expirationDate)
        .withClaim("extraClaims", extraClaims);

    if (orgId != null) {
      builder = builder.withClaim("orgId", orgId);
    }

    return builder.sign(algorithm);
  }

  private boolean isTokenExpired(String token) {
    Date expirationDate = extractExpiration(token);
    return expirationDate.before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, DecodedJWT::getExpiresAt);
  }

  private Map<String, Object> createHeader() {
    Map<String, Object> header = new HashMap<>();
    header.put("typ", "JWT");
    return header;
  }

  private byte[] getSigningKey() {
    return Base64.getEncoder().encode(jwtSigningKey.getBytes());

  }
}
