package es.timescope.rest.Usuarios.dto;

import es.timescope.rest.Usuarios.models.Roles;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioUpdateDto {
    private String nombres;

    private String apellidos;

    @Email(regexp = ".*@.*\\..*", message = "Email debe ser válido")
    private String email;

    private String username;

    private String password;

    private Roles rol;

    private Boolean isDeleted;
}

