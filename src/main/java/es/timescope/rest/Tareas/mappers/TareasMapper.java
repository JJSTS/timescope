package es.timescope.rest.Tareas.mappers;

import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TareasMapper {

    // este
    public Tarea toTarea(TareaCreateDto tareaCreateDto, Usuario usuario) {
        return Tarea.builder()
                .id(null)
                .nombre(tareaCreateDto.getNombre())
                .descripcion(tareaCreateDto.getDescripcion())
                .fechaCreacion(LocalDateTime.now())
                .usuario(usuario)
                .build();

    }

    public Tarea toTarea(TareaCreateDto tareaCreateDto) {
        return Tarea.builder()
                .id(null)
                .nombre(tareaCreateDto.getNombre())
                .descripcion(tareaCreateDto.getDescripcion())
                .fechaCreacion(LocalDateTime.now())
                .build();

    }

    public Tarea toTarea(TareaUpdateDto tareaUpdateDto, Tarea tarea) {
        return Tarea.builder()
                .id(tarea.getId())
                .nombre(tareaUpdateDto.getNombre() != null ? tareaUpdateDto.getNombre() : tarea.getNombre())
                .descripcion(tareaUpdateDto.getDescripcion() != null ? tareaUpdateDto.getDescripcion() : tarea.getDescripcion())
                .estado(tareaUpdateDto.getEstado() != null ? tareaUpdateDto.getEstado() : tarea.getEstado())
                .build();
    }

    public TareaResponseDto toTareaResponseDto(Tarea tarea) {
        return TareaResponseDto.builder()
                .id(tarea.getId())
                .nombre(tarea.getNombre())
                .descripcion(tarea.getDescripcion())
                .estado(tarea.getEstado())
                .fechaCreacion(tarea.getFechaCreacion())
                .usuario(tarea.getUsuario() != null ? tarea.getUsuario().getNombres() : null)
                .build();
    }

    public List<TareaResponseDto> toTareaResponseDtoList(List<Tarea> tarea) {
        return tarea.stream()
                .map(this::toTareaResponseDto)
                .toList();
    }

    public Page<TareaResponseDto> toResponseDtoPage(Page<Tarea> tareas) {
        return tareas.map(this::toTareaResponseDto);
    }

}
