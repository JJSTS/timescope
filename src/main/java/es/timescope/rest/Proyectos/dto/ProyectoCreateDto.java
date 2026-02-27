package es.timescope.rest.Proyectos.dto;
// Quizá no es necesario

import es.timescope.rest.Proyectos.models.Estado;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;
@Builder
@Data
public class ProyectoCreateDto {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Size(max = 300, message = "La descripción no puede exceder 300 caracteres")
    private String descripcion;

    @NotNull(message = "El estado es obligatorio")
    private Estado estado;

    private List<Long> usuarios;

    @Builder.Default
    private Boolean isDeleted = false;
}