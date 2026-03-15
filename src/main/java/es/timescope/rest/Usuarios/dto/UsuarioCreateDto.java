package es.timescope.rest.Usuarios.dto;

import es.timescope.rest.Usuarios.models.Roles;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCreateDto {
    @NotBlank(message = "Los nombres no deben de estar vacíos")
    private String nombres;

    @NotBlank(message = "Los apellidos no deben de estar vacíos")
    private String apellidos;

    @Email(regexp = ".*@.*\\..*", message = "Email debe ser válido")
    private String email;

    @NotBlank(message = "El username no debe de estar vacío")
    private String username;

    @NotBlank(message = "La contraseña no debe estar vacía")
    private String password;

    @Builder.Default
    private Set<Roles> roles = Set.of(Roles.DESARROLLADOR);

    @Builder.Default
    private Boolean isDeleted = false;
}
