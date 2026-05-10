package es.timescope.rest.Tareas.services;


import es.timescope.rest.Tareas.dto.TareaAddDto;
import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Tareas.models.Estado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TareasServices {

    Page<TareaResponseDto> findAll(Optional<String> usuario, Optional<String> estado, Pageable pageable);

    List<TareaResponseDto> findByUsuarioId(Long usuarioId);
    Page<TareaResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable);
    List<TareaResponseDto> findByUsuarioIdAndEstado(Long usuarioId, Estado estado);

    TareaResponseDto findById(Long id);

    TareaResponseDto createTarea(TareaCreateDto tareaCreateDto);

    TareaResponseDto updateTarea(Long id, TareaUpdateDto tareaUpdateDto);

    TareaResponseDto addTarea(TareaAddDto tareaAddDto);

    List<TareaResponseDto> findByProyectoId(Long proyectoId);

    Page<TareaResponseDto> findByProyectoId(Long proyectoId, Pageable pageable);
}
