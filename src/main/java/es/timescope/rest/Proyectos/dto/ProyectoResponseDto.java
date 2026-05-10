package es.timescope.rest.Proyectos.dto;

import es.timescope.rest.Proyectos.models.Estado;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class ProyectoResponseDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private Estado estado;
    private List<Long> usuarios;
    private Boolean isDeleted;
    private Integer membrosCount;
    private Integer tareasCount;
    private String liderNombre;
}
