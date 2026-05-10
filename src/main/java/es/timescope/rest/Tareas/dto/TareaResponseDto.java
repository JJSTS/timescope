package es.timescope.rest.Tareas.dto;

import es.timescope.rest.Tareas.models.Estado;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TareaResponseDto {

    private Long id;
    private String nombre;
    private String descripcion;
    private Estado estado;
    private BigDecimal horasEstimadas;
    private LocalDateTime fechaLimite;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String usuario;
    private Long proyectoId;
    private String proyectoNombre;

}
