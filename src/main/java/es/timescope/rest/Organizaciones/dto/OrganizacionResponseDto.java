package es.timescope.rest.Organizaciones.dto;

import es.timescope.rest.Usuarios.models.Usuario;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrganizacionResponseDto {
    private Long id;
    private String nombre;

    private Long empresaMatrizId;
    private List<Long> filialesIds;


    private String administrador;
    private String userAdmin;

    private List<String> directoresUsernames;

    private List<Long> proyectosIds;
    private List<Long> usuariosIds;
}