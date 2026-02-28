package es.timescope.rest.Proyectos.services;

import es.timescope.rest.Proyectos.dto.*;
import es.timescope.rest.Proyectos.models.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface ProyectoServices {
    Page<ProyectoResponseDto> findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable);

    Proyecto findByEstado(Estado estado);

    ProyectoResponseDto save(ProyectoCreateDto proyectoCreateDto);

//    Proyecto update(Long id, ProyectoUpdateDto proyectoUpdateDto);

    void deleteById(Long id);
}
