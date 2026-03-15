package es.timescope.rest.Usuarios.dto;

import es.timescope.rest.Usuarios.models.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioInfoResponse {
    private Long id;
    private String nombres;
    private String apellidos;
    private String email;
    private Long tiempoProyecto;
    private String username;

    @Builder.Default
    private Set<Roles> roles = Set.of(Roles.DESARROLLADOR);

    @Builder.Default
    private List<String> proyectos = new ArrayList<>();

    @Builder.Default
    private List<String> tareas = new ArrayList<>();

    @Builder.Default
    private Boolean isDeleted = false;
}
