package es.timescope.rest.Tareas.dto;

import es.timescope.rest.Tareas.models.Estado;
import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TareaUpdateDto {

    @Size(min = 4, message = "El nombre de la tarea debe tener más de 4 caracteres")
    private String nombre;

    private String descripcion;

    private Estado estado;

    private String usuario;
}