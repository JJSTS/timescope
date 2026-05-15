package es.timescope.rest.auth.dto;

import lombok.Data;

@Data
public class ResetPasswordDto {
    private String username;
    private String code;
    private String newPassword;
    private String passwordConfirm;
}
