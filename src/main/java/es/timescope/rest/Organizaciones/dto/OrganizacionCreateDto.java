package es.timescope.rest.Organizaciones.dto;

import lombok.Data;

@Data
public class OrganizacionCreateDto {
    private String nombre;
    private Long empresaMatrizId;
}