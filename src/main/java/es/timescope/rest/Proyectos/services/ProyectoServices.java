package es.timescope.rest.Proyectos.services;

import es.timescope.rest.Proyectos.dto.*;
import es.timescope.rest.Proyectos.models.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface ProyectoServices {
    Page<Proyecto> findAll(Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable);

    Proyecto findByNombre(String nombre);

    Proyecto findById(Long id);

    Proyecto findByEstado(Estado estado);

    Proyecto save(ProyectoCreateDto ProyectoCreateDto);

//    Proyecto update(Long id, ProyectoUpdateDto ProyectolUpdateDto);

    void deleteById(Long id);
}
