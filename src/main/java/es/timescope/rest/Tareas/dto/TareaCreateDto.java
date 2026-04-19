package es.timescope.rest.Tareas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@AllArgsConstructor
@Data
public class TareaCreateDto {

    @NotBlank(message = "La Tarea debe tener un nombre")
    private final String nombre;

    @NotBlank(message = "La Tarea debe tener una descripción")
    private final String descripcion;

//    @NotBlank(message = "La tarea debe tener un usuario")
//    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El usuario solo puede contener letras y números")
//    private final String usuario;

}
