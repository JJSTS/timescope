package es.timescope.rest.Tareas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TareaCreateDto {

    @NotBlank(message = "La Tarea debe tener un nombre")
    private final String nombre;

    @NotBlank(message = "La Tarea debe tener una descripción")
    private final String descripcion;

}
