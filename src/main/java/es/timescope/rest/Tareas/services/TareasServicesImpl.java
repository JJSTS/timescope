package es.timescope.rest.Tareas.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Notificacion.models.Tipo;
import es.timescope.rest.Notificacion.service.NotificacionService;
import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Tareas.dto.TareaAddDto;
import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.exceptions.TareaCreateException;
import es.timescope.rest.Tareas.exceptions.TareaNotFound;
import es.timescope.rest.Tareas.models.Estado;
import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Tareas.mappers.TareasMapper;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Tareas.repositories.TareasRepository;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
    private final NotificacionService notificacionService;
    private final AuthUtils authUtils;

    private Specification<Tarea> specOrganizacion(Usuario caller) {
        return (root, query, cb) -> {
            if (caller.getOrganizacion() == null) return cb.disjunction();
            Join<Object, Object> proyectoJoin = root.join("proyecto", JoinType.LEFT);
            Join<Object, Object> orgJoin = proyectoJoin.join("organizacion", JoinType.LEFT);
            return cb.equal(orgJoin.get("id"), caller.getOrganizacion().getId());
        };
    }

    @Override
    public Page<TareaResponseDto> findAll(Optional<String> usuario, Optional<String> estado, Pageable pageable){
        log.info("Buscando tareas por usuario: {}, estado: {}", usuario, estado);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        // DESARROLLADOR solo puede ver sus propias tareas
        boolean esDesarrollador = !authUtils.callerHasRole(Roles.DIRECTOR)
                && !authUtils.callerHasRole(Roles.LIDER);
        if (esDesarrollador) {
            usuario = Optional.of(caller.getUsername());
            log.info("Rol DESARROLLADOR: filtrando tareas solo para {}", caller.getUsername());
        }

        final Optional<String> usuarioFinal = usuario;

        Specification<Tarea> specUsuario = (root, query, criteriaBuilder) ->
                usuarioFinal.map(n -> {
                    Join<Tarea, Usuario> usuarioJoin = root.join("usuario");
                    return criteriaBuilder.like(criteriaBuilder.lower(usuarioJoin.get("username")), "%" + n.toLowerCase() + "%");
                }).orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Tarea> specEstado = (root, query, criteriaBuilder) ->
                estado.map(n -> criteriaBuilder.like(criteriaBuilder.lower(root.get("estado")), "%" + n.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Tarea> criterio = Specification.allOf(specUsuario, specEstado, specOrganizacion(caller));

        return tareasRepository.findAll(criterio, pageable).map(tareasMapper::toTareaResponseDto);
    }

    @Override
    public Page<TareaResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable) {
        log.info("Buscando todas las tareas del usuario con id: {}", usuarioId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        Specification<Tarea> specUsuarioId = (root, query, cb) ->
                cb.equal(root.get("usuario").get("id"), usuarioId);

        return tareasRepository.findAll(specUsuarioId.and(specOrganizacion(caller)), pageable)
                .map(tareasMapper::toTareaResponseDto);
    }

    @Override
    public TareaResponseDto findById(Long id) {
        log.info("Buscando el tarea con id: {}", id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Tarea tarea = tareasRepository.findById(id).orElseThrow(() -> new TareaNotFound(id));

        if (tarea.getProyecto() != null && caller.getOrganizacion() != null) {
            Proyecto proyecto = tarea.getProyecto();
            if (proyecto.getOrganizacion() == null
                    || !proyecto.getOrganizacion().getId().equals(caller.getOrganizacion().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta tarea");
            }
        }

        return tareasMapper.toTareaResponseDto(tarea);
    }

    @Override
    public List<TareaResponseDto> findByUsuarioId(Long usuarioId){
        log.info("Buscando todas las tareas del usuario con id: {}", usuarioId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        Specification<Tarea> specUsuarioId = (root, query, cb) ->
                cb.equal(root.get("usuario").get("id"), usuarioId);

        return tareasMapper.toTareaResponseDtoList(
                tareasRepository.findAll(specUsuarioId.and(specOrganizacion(caller)))
        );
    }

    @Override
    public List<TareaResponseDto> findByUsuarioIdAndEstado(Long usuarioId, Estado estado) {
        log.info("Buscando todas las tareas del usuario con id: {} y estado: {}", usuarioId, estado);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        Specification<Tarea> spec = (root, query, cb) ->
                cb.and(
                        cb.equal(root.get("usuario").get("id"), usuarioId),
                        cb.equal(root.get("estado"), estado)
                );

        return tareasMapper.toTareaResponseDtoList(
                tareasRepository.findAll(spec.and(specOrganizacion(caller)))
        );
    }

    @Override
    public TareaResponseDto createTarea(TareaCreateDto tareaCreateDto){
        log.info("Creando tarea: {}", tareaCreateDto);
        try {
            Tarea tarea;
            if (tareaCreateDto.getProyectoId() != null) {
                Proyecto proyecto = proyectosRepository.findById(tareaCreateDto.getProyectoId())
                        .orElseThrow(() -> new TareaCreateException("Proyecto con id " + tareaCreateDto.getProyectoId() + " no encontrado"));
                tarea = tareasMapper.toTarea(tareaCreateDto, proyecto);
            } else {
                tarea = tareasMapper.toTarea(tareaCreateDto);
            }
            return tareasMapper.toTareaResponseDto(tareasRepository.save(tarea));
        } catch (TareaCreateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al crear la tarea: {}", e.getMessage());
            throw new TareaCreateException("No fue posible crear la tarea: " + e.getMessage());
        }
    }

    @Override
    public TareaResponseDto updateTarea(Long id, TareaUpdateDto tareaUpdateDto) {
        log.info("Actualizando tarea con id: {}", id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Tarea tareaOpt = tareasRepository.findById(id)
                .orElseThrow(() -> new TareaNotFound(id));

        // DESARROLLADOR solo puede editar sus propias tareas
        boolean soloDesarrollador = !authUtils.callerHasRole(Roles.DIRECTOR)
                && !authUtils.callerHasRole(Roles.LIDER);
        if (soloDesarrollador) {
            boolean esSuTarea = tareaOpt.getUsuario() != null
                    && tareaOpt.getUsuario().getId().equals(caller.getId());
            if (!esSuTarea) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes editar tus propias tareas");
            }
        }

        Usuario usuario = usuariosRepository.findByNombres(tareaUpdateDto.getUsuario());
        log.info("Usuario asociado a la tarea: {}", usuario);
        Tarea tarea = tareasMapper.toTarea(tareaUpdateDto, tareaOpt, usuario);

        if (tareaUpdateDto.getEstado() == Estado.ACTIVO) {
            if (tareaOpt.getEstado() == Estado.REVISION) {
                // Reactivación desde REVISION: reinicia el contador
                tarea.setFechaInicio(java.time.LocalDateTime.now());
                tarea.setFechaFin(null);
            } else if (tareaOpt.getFechaInicio() == null) {
                // Primera activación desde ABIERTO
                tarea.setFechaInicio(java.time.LocalDateTime.now());
            }
        }
        if (tareaUpdateDto.getEstado() == Estado.REVISION) {
            tarea.setFechaFin(java.time.LocalDateTime.now());
        }

        return tareasMapper.toTareaResponseDto(tareasRepository.save(tarea));
    }

    @Override
    public List<TareaResponseDto> findByProyectoId(Long proyectoId) {
        log.info("Buscando tareas del proyecto con id: {}", proyectoId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Proyecto proyecto = proyectosRepository.findById(proyectoId)
                .orElseThrow(() -> new TareaCreateException("Proyecto con id " + proyectoId + " no encontrado"));
        validarOrgProyecto(caller, proyecto);
        return tareasMapper.toTareaResponseDtoList(tareasRepository.findByProyectoId(proyectoId));
    }

    @Override
    public Page<TareaResponseDto> findByProyectoId(Long proyectoId, Pageable pageable) {
        log.info("Buscando tareas del proyecto con id: {} (paginado)", proyectoId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Proyecto proyecto = proyectosRepository.findById(proyectoId)
                .orElseThrow(() -> new TareaCreateException("Proyecto con id " + proyectoId + " no encontrado"));
        validarOrgProyecto(caller, proyecto);
        return tareasRepository.findByProyectoId(proyectoId, pageable).map(tareasMapper::toTareaResponseDto);
    }

    private void validarOrgProyecto(Usuario caller, Proyecto proyecto) {
        if (caller.getOrganizacion() == null || proyecto.getOrganizacion() == null
                || !proyecto.getOrganizacion().getId().equals(caller.getOrganizacion().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a este proyecto");
        }
    }

    @Override
    public void deleteById(Long id) {
        log.info("Eliminando tarea con id: {}", id);
        tareasRepository.findById(id).orElseThrow(() -> new TareaNotFound(id));
        tareasRepository.deleteById(id);
    }

    @Override
    public TareaResponseDto addTarea(TareaAddDto tareaAddDto) {
        log.info("Asignando tarea con id '{}' al usuario con username: {}", tareaAddDto.getTareaId(), tareaAddDto.getUsername());
        
        Tarea tarea = tareasRepository.findById(tareaAddDto.getTareaId())
                .orElseThrow(() -> new TareaNotFound(tareaAddDto.getTareaId()));
        
        Usuario usuario = usuariosRepository.findByUsername(tareaAddDto.getUsername())
                .orElseThrow(() -> new UsuarioNotFound("Usuario con username '" + tareaAddDto.getUsername() + "' no encontrado"));
        
        try {
            tarea.setUsuario(usuario);
            tarea.setEstado(Estado.ABIERTO);
            Tarea tareaActualizada = tareasRepository.save(tarea);
            log.info("Tarea con id: {} asignada exitosamente al usuario: {}", tareaActualizada.getId(), tareaAddDto.getUsername());
            notificacionService.enviarNotificacion(
                    usuario.getUsername(),
                    "¡Se te ha asignado la tarea " + tareaActualizada.getNombre() + " !",
                    Tipo.TAREA_ASIGNADA
            );
            return tareasMapper.toTareaResponseDto(tareaActualizada);
        } catch (Exception e) {
            log.error("Error al asignar tarea {} al usuario {}: {}", tareaAddDto.getTareaId(), tareaAddDto.getUsername(), e.getMessage());
            throw new TareaCreateException("No fue posible asignar la tarea al usuario " + tareaAddDto.getUsername() + ": " + e.getMessage());
        }
    }

}
