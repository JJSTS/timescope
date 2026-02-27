package es.timescope.rest.Proyectos.mappers;

import es.timescope.rest.Proyectos.dto.*;
import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class ProyectosMapper {
    public Proyecto toProyecto(ProyectoCreateDto dto, List<Usuario> usuarios) {
        return Proyecto.builder().
                id(null).
                nombre(dto.getNombre()).
                descripcion(dto.getDescripcion()).
                estado(dto.getEstado()).
                usuarios(usuarios).
                isDeleted(dto.getIsDeleted()).
                build();
    }

    public ProyectoResponseDto toProyectoResponseDto(Proyecto proyecto) {
        return ProyectoResponseDto.builder().
                id(proyecto.getId()).
                nombre(proyecto.getNombre()).
                descripcion(proyecto.getDescripcion()).
                estado(proyecto.getEstado()).
                usuarios(
                    proyecto.getUsuarios()
                        .stream()
                        .map(Usuario::getId)
                        .toList()
                ).
                isDeleted(proyecto.getIsDeleted()).
                build();
    }

    public List<ProyectoResponseDto> toResponseDtoList(List<Proyecto> proyecto) {
        return proyecto.stream()
                .map(this::toProyectoResponseDto)
                .toList();
    }

    public Page<ProyectoResponseDto> toResponseDtoPage(Page<Proyecto> proyecto) {
        return proyecto.map(this::toProyectoResponseDto);
    }
}
