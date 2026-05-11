package es.timescope.rest.Proyectos.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Notificacion.models.Tipo;
import es.timescope.rest.Notificacion.service.NotificacionService;
import es.timescope.rest.Proyectos.dto.ProyectoCreateDto;
import es.timescope.rest.Proyectos.dto.ProyectoResponseDto;
import es.timescope.rest.Proyectos.exceptions.ProyectoBadRequestException;
import es.timescope.rest.Proyectos.mappers.ProyectosMapper;
import es.timescope.rest.Proyectos.models.Estado;
import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Proyectos.exceptions.ProyectoNotFoundException;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;

import jakarta.persistence.criteria.Join;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@CacheConfig(cacheNames = {"proyectos"})
@Slf4j
@RequiredArgsConstructor
@Service
public class ProyectoServicesImpl implements ProyectoServices {
    private final ProyectosRepository proyectosRepository;
    private final UsuariosRepository usuariosRepository;
    private final ProyectosMapper proyectoMapper;
    private final NotificacionService notificacionService;
    private final AuthUtils authUtils;

    private boolean tieneAccesoTotal() {
        return authUtils.callerHasRole(Roles.DIRECTOR);
    }

    @Override
    public Page<ProyectoResponseDto> findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable) {
        log.info("Buscando proyectos por id: {}, nombre: {} , isDeleted {}", id, nombre, isDeleted);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        boolean restricted = !tieneAccesoTotal();

        Specification<Proyecto> specIdProyecto = (root, query, criteriaBuilder) ->
                id.map(i -> criteriaBuilder.equal(root.get("id"), i))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Proyecto> specNombreProyecto = (root, query, criteriaBuilder) ->
                nombre.map(t -> criteriaBuilder.like(criteriaBuilder.lower(root.get("nombre")), "%" + t.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Proyecto> specIsDeleted = (root, query, criteriaBuilder) ->
                isDeleted.map(d -> criteriaBuilder.equal(root.get("isDeleted"), d))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Proyecto> specUsuario = (root, query, cb) -> {
            if (!restricted) return cb.isTrue(cb.literal(true));
            Join<Proyecto, Usuario> join = root.join("usuarios");
            return cb.equal(join.get("id"), caller.getId());
        };

        Specification<Proyecto> criterio = Specification.where(specIdProyecto)
                .and(specNombreProyecto)
                .and(specIsDeleted)
                .and(specUsuario);

        return proyectosRepository.findAll(criterio, pageable).map(proyectoMapper::toProyectoResponseDto);
    }

    @Override
    public ProyectoResponseDto findById(Long id) {
        log.info("Buscando proyecto por id: {}", id);
        Proyecto proyecto = proyectosRepository.findById(id)
                .orElseThrow(() -> new ProyectoNotFoundException(id));
        return proyectoMapper.toProyectoResponseDto(proyecto);
    }

    @Override
    public Page<ProyectoResponseDto> findByEstado(Estado estado, Pageable pageable) {
        log.info("Buscando proyectos por estado: {}", estado);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        boolean restricted = !tieneAccesoTotal();

        Specification<Proyecto> specEstado = (root, query, cb) ->
                cb.equal(root.get("estado"), estado);

        Specification<Proyecto> specUsuario = (root, query, cb) -> {
            if (!restricted) return cb.isTrue(cb.literal(true));
            Join<Proyecto, Usuario> join = root.join("usuarios");
            return cb.equal(join.get("id"), caller.getId());
        };

        return proyectosRepository.findAll(specEstado.and(specUsuario), pageable)
                .map(proyectoMapper::toProyectoResponseDto);
    }

    @Override
    public Page<ProyectoResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable) {
        log.info("Obteniendo proyectos del usuario con id: {}", usuarioId);
        return proyectosRepository.findByUsuarioId(usuarioId, pageable)
                .map(proyectoMapper::toProyectoResponseDto);
    }

    @Override
    public ProyectoResponseDto save(ProyectoCreateDto proyectoCreateDto) {
        log.info("Guardando proyecto: {}", proyectoCreateDto);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        List<Usuario> usuarios = checkUsuarios(proyectoCreateDto.getUsuarios());
        Proyecto proyecto = proyectoMapper.toProyecto(proyectoCreateDto, usuarios);
        proyecto.setOrganizacion(caller.getOrganizacion());
        return proyectoMapper.toProyectoResponseDto(proyectosRepository.save(proyecto));
    }

    @Override
    public ProyectoResponseDto addUsuario(Long id, String username) {
        log.info("Añadiendo usuario {} al proyecto {}", username, id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Proyecto proyecto = proyectosRepository.findById(id)
                .orElseThrow(() -> new ProyectoNotFoundException(id));

        // LIDER solo puede añadir usuarios a proyectos donde él está asignado
        if (!tieneAccesoTotal()) {
            boolean estaEnProyecto = proyecto.getUsuarios().stream()
                    .anyMatch(u -> u.getId().equals(caller.getId()));
            if (!estaEnProyecto) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Solo puedes añadir usuarios a proyectos en los que participas");
            }
        }

        Usuario usuario = usuariosRepository.findByUsername(username)
                .orElseThrow(() -> new ProyectoBadRequestException("Usuario con username: " + username + " no encontrado"));

        // El usuario debe pertenecer a la misma organización que el caller
        Long callerOrgId = authUtils.getCallerOrgId();
        if (callerOrgId == null && caller.getOrganizacion() != null) {
            callerOrgId = caller.getOrganizacion().getId();
        }
        if (callerOrgId == null || usuario.getOrganizacion() == null
                || !usuario.getOrganizacion().getId().equals(callerOrgId)) {
            throw new ProyectoBadRequestException(
                    "El usuario '" + username + "' no pertenece a esta organización");
        }

        if (proyecto.getUsuarios().contains(usuario)) {
            throw new ProyectoBadRequestException("El usuario ya pertenece a este proyecto");
        }

        notificacionService.enviarNotificacion(
                username,
                "¡Se te ha añadido al proyecto " + proyecto.getNombre() + " !",
                Tipo.EQUIPO_UNIDO
        );

        proyecto.getUsuarios().add(usuario);
        return proyectoMapper.toProyectoResponseDto(proyectosRepository.save(proyecto));
    }

    @Override
    public ProyectoResponseDto cambiarEstado(Long id, Estado estado) {
        log.info("Cambiando estado del proyecto {} a {}", id, estado);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Proyecto proyecto = proyectosRepository.findById(id)
                .orElseThrow(() -> new ProyectoNotFoundException(id));

        // LIDER solo puede cambiar estado de proyectos donde está asignado
        if (!tieneAccesoTotal()) {
            boolean estaEnProyecto = proyecto.getUsuarios().stream()
                    .anyMatch(u -> u.getId().equals(caller.getId()));
            if (!estaEnProyecto) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Solo puedes cambiar el estado de proyectos en los que participas");
            }
        }

        proyecto.setEstado(estado);
        return proyectoMapper.toProyectoResponseDto(proyectosRepository.save(proyecto));
    }

    @Override
    public void deleteById(Long id) {
        proyectosRepository.findById(id).orElseThrow(() -> new ProyectoNotFoundException(id));
        proyectosRepository.deleteById(id);
    }

    private List<Usuario> checkUsuarios(List<Long> usuariosIds) {
        log.info("Buscando usuarios por id: {}", usuariosIds);
        if (usuariosIds == null) return new ArrayList<>();
        List<Usuario> usuarios = new ArrayList<>();
        for (Long uid : usuariosIds) {
            var usuario = usuariosRepository.findById(uid).orElse(null);
            if (usuario == null || usuario.getIsDeleted()) {
                throw new ProyectoBadRequestException("El usuario con id: " + uid + " no existe o está borrado");
            }
            usuarios.add(usuario);
        }
        return usuarios;
    }
}
