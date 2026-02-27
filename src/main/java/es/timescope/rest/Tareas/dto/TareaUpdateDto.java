package es.timescope.rest.Tareas.dto;

import es.timescope.rest.Tareas.models.Estado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TareaUpdateDto {

    @Size(min = 4, message = "El nombre de la tarea debe tener más de 4 caracteres")
    @NotBlank(message = "La Tarea debe tener un nombre")
    private final String nombre;

    @NotBlank(message = "La Tarea debe tener una descripción")
    private final String descripcion;

    @NotNull(message = "El estado es obligatorio para actualizar")
    private final Estado estado;

    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El usuario solo puede contener letras y números")
    private final String usuario;
}