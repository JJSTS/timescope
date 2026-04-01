package es.timescope.rest.Tareas.services;


import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.models.Tarea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TareasServices {

    Page<TareaResponseDto> findAll(Optional<String> usuario, Optional<String> estado, Pageable pageable);

    List<Tarea> findByUsuarioId(Long usuarioId);
    Page<TareaResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable);

    TareaResponseDto findById(Long id);

    TareaResponseDto createTarea(TareaCreateDto tareaCreateDto);
}
