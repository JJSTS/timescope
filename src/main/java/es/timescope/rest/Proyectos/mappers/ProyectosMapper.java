package es.timescope.rest.Proyectos.mappers;

import es.timescope.rest.Proyectos.dto.*;
import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class ProyectosMapper {
    public Proyecto toProyecto(ProyectoCreateDto dto, List<Usuario> usuarios) {
        return Proyecto.builder()
                .id(null)
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .estado(dto.getEstado())
                .usuarios(usuarios)
                .isDeleted(dto.getIsDeleted())
                .build();
    }

    public ProyectoResponseDto toProyectoResponseDto(Proyecto proyecto) {
        List<Usuario> usuarios = proyecto.getUsuarios() != null ? proyecto.getUsuarios() : List.of();

        String liderNombre = usuarios.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(Roles.LIDER))
                .map(u -> u.getNombres() + " " + u.getApellidos())
                .findFirst()
                .orElse(null);

        int tareasCount = proyecto.getTareas() != null ? proyecto.getTareas().size() : 0;

        return ProyectoResponseDto.builder()
                .id(proyecto.getId())
                .nombre(proyecto.getNombre())
                .descripcion(proyecto.getDescripcion())
                .estado(proyecto.getEstado())
                .usuarios(usuarios.stream().map(Usuario::getId).toList())
                .isDeleted(proyecto.getIsDeleted())
                .membrosCount(usuarios.size())
                .tareasCount(tareasCount)
                .liderNombre(liderNombre)
                .build();
    }

    public List<ProyectoResponseDto> toResponseDtoList(List<Proyecto> proyectos) {
        return proyectos.stream().map(this::toProyectoResponseDto).toList();
    }

    public Page<ProyectoResponseDto> toResponseDtoPage(Page<Proyecto> proyectos) {
        return proyectos.map(this::toProyectoResponseDto);
    }
}
