package es.timescope.rest.Tareas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TareaCreateDto {

    @NotBlank(message = "La Tarea debe tener un nombre")
    private String nombre;

    @NotBlank(message = "La Tarea debe tener una descripción")
    private String descripcion;

    private Long proyectoId;
    private BigDecimal horasEstimadas;

    @NotNull(message = "La Tarea debe tener una fecha límite")
    private LocalDateTime fechaLimite;
}
