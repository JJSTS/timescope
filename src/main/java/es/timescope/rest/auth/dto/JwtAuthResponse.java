package es.timescope.rest.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {
  private String token;
  /** Org activa embebida en el token; null si el token es global. */
  private Long orgId;
}
