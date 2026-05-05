package es.timescope.rest.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {
    @NotBlank
    @Length(min = 5, message = "Password debe tener al menos 5 caracteres")
    private String password;

    @NotBlank(message = "La contraseña debe de tener más de 4 carácteres")
    @Length(min = 5, message = "Password de comprobación debe tener al menos 5 caracteres")
    private String newPassword;

    @NotBlank(message = "Password no puede estar vacío")
    @Length(min = 5, message = "Password de comprobación debe tener al menos 5 caracteres")
    private String passwordComprobacion;
}
