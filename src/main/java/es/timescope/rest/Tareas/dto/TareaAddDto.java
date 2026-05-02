package es.timescope.rest.Tareas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TareaAddDto {

    @NotNull(message = "El ID de la tarea es obligatorio")
    private Long tareaId;

    @NotBlank(message = "El username del usuario es obligatorio")
    private String username;
}

