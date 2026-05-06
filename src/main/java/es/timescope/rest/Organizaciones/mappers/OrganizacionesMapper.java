package es.timescope.rest.Organizaciones.mappers;

import es.timescope.rest.Organizaciones.dto.OrganizacionResponseDto;
import es.timescope.rest.Organizaciones.models.Organizacion;

import java.util.stream.Collectors;

public class OrganizacionesMapper {

    public static OrganizacionResponseDto toDto(Organizacion org) {
        return OrganizacionResponseDto.builder()
                .id(org.getId())
                .nombre(org.getNombre())
                .empresaMatrizId(
                        org.getEmpresaMatriz() != null ? org.getEmpresaMatriz().getId() : null
                )
                .filialesIds(
                        org.getFiliales() != null ?
                                org.getFiliales().stream().map(Organizacion::getId).collect(Collectors.toList())
                                : null
                )
                .proyectosIds(
                        org.getProyectos() != null ?
                                org.getProyectos().stream().map(p -> p.getId()).collect(Collectors.toList())
                                : null
                )
                .usuariosIds(
                        org.getUsuarios() != null ?
                                org.getUsuarios().stream().map(u -> u.getId()).collect(Collectors.toList())
                                : null
                )
                .administrador(org.getAdmin().getNombres() + " " + org.getAdmin().getApellidos())
                .userAdmin(org.getAdmin().getUsername())
                .build();
    }
}