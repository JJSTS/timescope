package es.timescope.rest.auth.services.authentication;


import es.timescope.rest.auth.dto.JwtAuthResponse;
import es.timescope.rest.auth.dto.UserSignInRequest;
import es.timescope.rest.auth.dto.UserSignUpRequest;

public interface AuthenticationService {
  JwtAuthResponse signUp(UserSignUpRequest request);

  JwtAuthResponse signIn(UserSignInRequest request);
}
