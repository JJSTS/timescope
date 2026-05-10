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

import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@CacheConfig(cacheNames = {"usuarios"})
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuariosService {
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
        return usuarioMapper.toUsuarioResponseDto(usuario, authUtils.getCallerRole());
    }

    private static final Map<Roles, Integer> ROLE_LEVEL = Map.of(
            Roles.DIRECTOR,     3,
            Roles.LIDER,        2,
            Roles.DESARROLLADOR,1
    );

    @Override
    @Transactional
    public void asignarRol(Long id, Roles role) {
        log.info("Asignando un rol al usuario con id: {}", id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Usuario objetivo = usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));

        // Un usuario no puede cambiar su propio rol
        if (caller.getId().equals(objetivo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes cambiar tu propio rol");
        }

        // El caller debe tener un nivel jerárquico superior al del objetivo
        int callerLevel  = callerMaxLevel();
        int objetivoLevel = objetivoMaxLevel(objetivo);
        if (objetivoLevel >= callerLevel) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No puedes cambiar el rol de un usuario con igual o mayor jerarquía que la tuya");
        }

        // El rol a asignar debe estar dentro de lo permitido para el caller
        validarRolAsignable(role);

        objetivo.setRol(role);
        usuariosRepository.save(objetivo);
    }

    private int callerMaxLevel() {
        if (authUtils.callerHasRole(Roles.DIRECTOR))     return ROLE_LEVEL.get(Roles.DIRECTOR);
        if (authUtils.callerHasRole(Roles.LIDER))        return ROLE_LEVEL.get(Roles.LIDER);
        return ROLE_LEVEL.get(Roles.DESARROLLADOR);
    }

    private int objetivoMaxLevel(Usuario objetivo) {
        return ROLE_LEVEL.getOrDefault(objetivo.getRol(), 0);
    }

    private void validarRolAsignable(Roles rolObjetivo) {
        if (authUtils.callerHasRole(Roles.DIRECTOR)) return;
        if (authUtils.callerHasRole(Roles.LIDER)) {
            if (rolObjetivo != Roles.LIDER && rolObjetivo != Roles.DESARROLLADOR) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Un LIDER solo puede asignar los roles LIDER o DESARROLLADOR");
            }
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para asignar roles");
    }
}
