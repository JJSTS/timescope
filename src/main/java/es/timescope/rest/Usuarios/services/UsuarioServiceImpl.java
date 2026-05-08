package es.timescope.rest.Usuarios.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Emails.services.UsuarioEmailService;
import es.timescope.rest.Usuarios.dto.UsuarioCreateDto;
import es.timescope.rest.Usuarios.dto.UsuarioInfoResponse;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.dto.UsuarioUpdateDto;
import es.timescope.rest.Usuarios.exceptions.UsuarioNombreOrEmailExists;
import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.mappers.UsuariosMapper;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@CacheConfig(cacheNames = {"usuarios"})
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuariosService {
    private final UsuarioEmailService usuarioEmailService;
    private final UsuariosRepository usuariosRepository;
    private final UsuariosMapper usuarioMapper;
    private final AuthUtils authUtils;

    @Override
    public Page<UsuarioResponseDto> findAll(Optional<String> username, Optional<String> email, Optional<Boolean> isDeleted, Pageable pageable) {
        log.info("Buscando todos los usuarios con username: {} y borrados: {}", username, isDeleted);
        Specification<Usuario> specUsuarioNombre = (root, query, criteriaBuilder) ->
                username.map(m -> criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), "%" + m.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Usuario> specEmailUsuario = (root, query, criteriaBuilder) ->
                email.map(m -> criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + m.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Usuario> specIsDeleted = (root, query, criteriaBuilder) ->
                isDeleted.map(m -> criteriaBuilder.equal(root.get("isDeleted"), m))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Usuario> criterio = Specification.allOf(
                specUsuarioNombre,
                specEmailUsuario,
                specIsDeleted
        );

        return usuariosRepository.findAll(criterio, pageable).map(usuarioMapper::toUsuarioResponseDto);
    }

    @Override
    @Cacheable(key = "#id")
    public UsuarioInfoResponse findById(Long id) {
        log.info("Buscando el usuario con id: {}", id);

        var usuario = usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));
        var proyectos = usuariosRepository.findProyectoByUsuarioId(id).stream().map(p -> p.getNombre()).toList();
        var tareas = usuariosRepository.findTareaByUsuarioId(id).stream().map(p -> p.getNombre()).toList();

        return usuarioMapper.toUsuarioInfoResponse(usuario, proyectos, tareas);
    }

    @Override
    public UsuarioResponseDto update(Long id, UsuarioCreateDto userRequest) {
        log.info("Buscando el usuario con id: {}", id);
        usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));
        usuariosRepository.findByUsernameEqualsIgnoreCaseOrEmailEqualsIgnoreCase(userRequest.getUsername(), userRequest.getEmail())
                .ifPresent(u -> {
                    if (!u.getId().equals(id)) {
                        throw new UsuarioNombreOrEmailExists("Ya existe un usuario con ese username o email");
                    }
                });
        return usuarioMapper.toUsuarioResponseDto(usuariosRepository.save(usuarioMapper.toUsuario(userRequest, id)));
    }

    @Override
    @CachePut(key = "#id")
    public UsuarioResponseDto updatePartial(Long id, UsuarioUpdateDto userRequest) {
        log.info("Actualizando parcialmente el usuario con id: {}", id);
        Usuario usuario = usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));

        if ((userRequest.getUsername() != null && !userRequest.getUsername().isBlank()) ||
            (userRequest.getEmail() != null && !userRequest.getEmail().isBlank())) {
            usuariosRepository.findByUsernameEqualsIgnoreCaseOrEmailEqualsIgnoreCase(
                    userRequest.getUsername() != null ? userRequest.getUsername() : usuario.getUsername(),
                    userRequest.getEmail() != null ? userRequest.getEmail() : usuario.getEmail())
                    .ifPresent(u -> {
                        if (!u.getId().equals(id)) {
                            throw new UsuarioNombreOrEmailExists("Ya existe un usuario con ese username o email");
                        }
                    });
        }

        usuarioMapper.updateUsuarioFromDto(userRequest, usuario);
        return usuarioMapper.toUsuarioResponseDto(usuariosRepository.save(usuario));
    }

    @Override
    public UsuarioResponseDto getMe() {
        Usuario usuario = authUtils.getUsuarioAuthentication(usuariosRepository);
        return usuarioMapper.toUsuarioResponseDto(usuario);
    }

    @Override
    @Transactional
    public void asignarRol(Long id, Roles role) {
        log.info("Asignando un rol al usuario con id: {}", id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Usuario usuario = usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));

        validarJerarquiaRol(caller, role);

        usuario.getRoles().clear();
        usuario.getRoles().add(role);
        usuariosRepository.save(usuario);
    }

    private void validarJerarquiaRol(Usuario caller, Roles rolObjetivo) {
        Set<Roles> rolesCalller = caller.getRoles();

        if (rolesCalller.contains(Roles.DIRECTOR)) {
            return;
        }
        if (rolesCalller.contains(Roles.COORDINADOR)) {
            if (rolObjetivo == Roles.DIRECTOR) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Un COORDINADOR no puede asignar el rol DIRECTOR");
            }
            return;
        }
        if (rolesCalller.contains(Roles.LIDER)) {
            if (rolObjetivo != Roles.LIDER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Un LIDER solo puede asignar el rol LIDER");
            }
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para asignar roles");
    }
}
