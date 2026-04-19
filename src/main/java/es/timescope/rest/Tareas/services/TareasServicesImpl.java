package es.timescope.rest.Tareas.services;

import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.mappers.TareasMapper;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Tareas.repositories.TareasRepository;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import jakarta.persistence.criteria.Join;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@CacheConfig(cacheNames = {"tareas"})
@Slf4j
@RequiredArgsConstructor
@Service
public class TareasServicesImpl implements TareasServices {
    private final TareasRepository tareasRepository;
    private final TareasMapper tareasMapper;

    private final UsuariosRepository usuariosRepository;
    private final ProyectosRepository proyectosRepository;

    @Override
    public Page<TareaResponseDto> findAll(Optional<String> usuario, Optional<String> estado, Pageable pageable){
        log.info("Buscando tareas por usuario: {}, estado: {}", usuario, estado);
        Specification<Tarea> specUsuario = (root, query, criteriaBuilder) ->
                usuario.map(n -> {
                    Join<Tarea, Usuario> usuarioJoin = root.join("usuario");
                    return criteriaBuilder.like(criteriaBuilder.lower(usuarioJoin.get("username")), "%" + n.toLowerCase() + "%");
                }).orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Tarea> specEstado = (root, query, criteriaBuilder) ->
                estado.map(n -> criteriaBuilder.like(criteriaBuilder.lower(root.get("estado")), "%" + n.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Tarea> criterio = Specification.allOf(specUsuario, specEstado);

        return tareasRepository.findAll(criterio, pageable).map(tareasMapper::toTareaResponseDto);
    }

    @Cacheable(key = "#id")
    @Override
    public Page<TareaResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable) {
        log.info("Buscando todas las tareas del usuario con id: {}", usuarioId);
        return tareasRepository.findByUsuarioId(usuarioId, pageable)
                .map(tareasMapper::toTareaResponseDto);
    }

    @Override
    public TareaResponseDto findById(Long id) {
        log.info("Buscando el tarea con id: {}", id);
        return tareasMapper.toTareaResponseDto(tareasRepository.findById(id).orElse(null));
    }

    @Override
    public List<Tarea> findByUsuarioId(Long usuarioId){
        return tareasRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public TareaResponseDto createTarea(TareaCreateDto tareaCreateDto){
        log.info("Creando tarea: {}", tareaCreateDto);
        Tarea tarea = tareasRepository.save(tareasMapper.toTarea(tareaCreateDto));
        return tareasMapper.toTareaResponseDto(tarea);
    }

    @Override
    public TareaResponseDto updateTarea(Long id, TareaUpdateDto tareaUpdateDto) {
        log.info("Actualizando tarea con id: {}", id);
        Tarea tareaOpt = tareasRepository.findById(id).orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
        Usuario usuario = usuariosRepository.findByNombres(tareaUpdateDto.getUsuario());
        log.info("Usuario asociado a la tarea: {}", usuario);
        Tarea tarea = tareasRepository.save(tareasMapper.toTarea(tareaUpdateDto, tareaOpt, usuario));
        return tareasMapper.toTareaResponseDto(tarea);
    }
}
