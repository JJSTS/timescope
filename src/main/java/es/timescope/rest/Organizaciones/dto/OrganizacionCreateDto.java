package es.timescope.rest.Organizaciones.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizacionCreateDto {
    @NotBlank(message = "Nombre de la organización no puede estar vacío")
    private String nombre;
}