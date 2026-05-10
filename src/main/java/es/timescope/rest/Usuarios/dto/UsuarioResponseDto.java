package es.timescope.rest.Usuarios.dto;


import es.timescope.rest.Usuarios.models.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDto {
    private Long id;
    private String nombres;
    private String apellidos;
    private String email;
    private String username;

    @Builder.Default
    private Set<Roles> roles = Set.of(Roles.DESARROLLADOR);

    @Builder.Default
    private Boolean isDeleted = false;

    private Long organizacionId;
}
