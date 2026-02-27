package es.timescope.rest.Usuarios.services;

import es.timescope.rest.Tareas.repositories.TareasRepository;
import es.timescope.rest.Usuarios.dto.UsuarioCreateDto;
import es.timescope.rest.Usuarios.dto.UsuarioInfoResponse;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.exceptions.UsuarioNombreOrEmailExists;
import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.mappers.UsuariosMapper;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@CacheConfig(cacheNames = {"usuarios"})
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuariosService {
    
    private final UsuariosRepository usuariosRepository;
    private final UsuariosMapper usuarioMapper;

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
        var proyectos =  usuariosRepository.findProyectoByUsuarioId(id).stream().map(p -> p.getNombre()).toList();
        var tareas = usuariosRepository.findTareaByUsuarioId(id).stream().map(p -> p.getNombre()).toList();

        return  usuarioMapper.toUsuarioInfoResponse(usuario, proyectos, tareas);
    }

    @Override
    @CachePut(key = "#result.id")
    public UsuarioResponseDto save(UsuarioCreateDto usuarioCreateDto) {
        log.info("Guardando usuario: {}", usuarioCreateDto);

        usuariosRepository.findByUsernameEqualsIgnoreCaseOrEmailEqualsIgnoreCase(usuarioCreateDto.getUsername(), usuarioCreateDto.getEmail())
                .ifPresent(u -> {
                    throw new UsuarioNombreOrEmailExists("Ya existe un usuario con ese username o email");
                });

        return usuarioMapper.toUsuarioResponseDto(usuariosRepository.save(usuarioMapper.toUsuario(usuarioCreateDto)));
    }

    @Override
    public UsuarioResponseDto update(Long id, UsuarioCreateDto userRequest) {
        log.info("Buscando el usuario con id: {}", id);
        usuariosRepository.findById(id).orElseThrow(() -> new UsuarioNotFound(id));
        // No debe existir otro con el mismo username o email, y si existe soy yo mismo
        usuariosRepository.findByUsernameEqualsIgnoreCaseOrEmailEqualsIgnoreCase(userRequest.getUsername(), userRequest.getEmail())
                .ifPresent(u -> {
                    if (!u.getId().equals(id)) {
                        System.out.println("usuario encontrado: " + u.getId() + " Mi id: " + id);
                        throw new UsuarioNombreOrEmailExists("Ya existe un usuario con ese username o email");
                    }
                });
        return usuarioMapper.toUsuarioResponseDto(usuariosRepository.save(usuarioMapper.toUsuario(userRequest, id)));
    }

    @Override
    public void deleteById(Long id) {

    }

    @Override
    public List<Usuario> findAllActiveUsuarios() {
        return List.of();
    }

    @Override
    public Optional<Usuario> findByUsuarioname(String username) {
        return Optional.empty();
    }

    @Override
    public void save(Usuario user) {

    }
}
