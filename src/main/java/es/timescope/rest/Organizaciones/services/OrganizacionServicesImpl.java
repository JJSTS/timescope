package es.timescope.rest.Organizaciones.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Organizaciones.dto.*;
import es.timescope.rest.Organizaciones.exceptions.OrganizacionNotFoundException;
import es.timescope.rest.Organizaciones.mappers.OrganizacionesMapper;
import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Organizaciones.repositories.OrganizacionesRepository;
import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.mappers.UsuariosMapper;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.models.UsuarioOrgRol;
import es.timescope.rest.Usuarios.repositories.UsuarioOrgRolRepository;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizacionServicesImpl implements OrganizacionServices {

    private final OrganizacionesRepository repository;
    private final ProyectosRepository proyectosRepository;
    private final UsuariosRepository usuariosRepository;
    private final UsuarioOrgRolRepository usuarioOrgRolRepository;
    private final AuthUtils authUtils;
    private final UsuariosMapper usuariosMapper;

    private Organizacion getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new OrganizacionNotFoundException(id));
    }

    @Override
    public Page<OrganizacionResponseDto> findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable) {

        Specification<Organizacion> specId = (root, query, criteriaBuilder) ->
                id.map(i -> criteriaBuilder.equal(root.get("id"), i))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Organizacion> specNombre = (root, query, criteriaBuilder) ->
                nombre.map(n -> criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("nombre")),
                                "%" + n.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Organizacion> specIsDeleted = (root, query, criteriaBuilder) ->
                isDeleted.map(d -> criteriaBuilder.equal(root.get("isDeleted"), d))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Organizacion> criterio = Specification.where(specId).and(specNombre).and(specIsDeleted);

        return repository.findAll(criterio, pageable).map(OrganizacionesMapper::toDto);
    }

    @Override
    @Transactional
    public OrganizacionResponseDto create(OrganizacionCreateDto dto) {
        Usuario admin = authUtils.getUsuarioAuthentication(usuariosRepository);

        admin.getRoles().add(Roles.DIRECTOR);
        usuariosRepository.save(admin);

        Organizacion org = new Organizacion();
        org.setNombre(dto.getNombre());
        org.setAdmin(admin);
        org.getDirectores().add(admin);

        Organizacion saved = repository.save(org);

        usuarioOrgRolRepository.save(UsuarioOrgRol.builder()
                .usuario(admin)
                .organizacion(saved)
                .rol(Roles.DIRECTOR)
                .build());

        return OrganizacionesMapper.toDto(saved);
    }

    @Override
    @Transactional
    public OrganizacionResponseDto cederAdmin(Long orgId, String username) {
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);
        Organizacion org = getEntity(orgId);

        if (!org.getAdmin().getId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el ADMIN puede ceder su puesto");
        }

        Usuario nuevoAdmin = usuariosRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNotFound(username));

        nuevoAdmin.getRoles().add(Roles.DIRECTOR);
        usuariosRepository.save(nuevoAdmin);

        org.setAdmin(nuevoAdmin);
        if (!org.getDirectores().contains(nuevoAdmin)) {
            org.getDirectores().add(nuevoAdmin);
        }
        return OrganizacionesMapper.toDto(repository.save(org));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Organizacion org = getEntity(id);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        boolean isAdmin = org.getAdmin() != null && org.getAdmin().getId().equals(caller.getId());
        boolean isDirector = caller.getRoles().contains(Roles.DIRECTOR);

        if (!isAdmin && !isDirector) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para eliminar esta organización");
        }

        repository.deleteById(id);
    }

    @Override
    public List<OrganizacionResponseDto> getFiliales(Long id) {
        return getEntity(id).getFiliales()
                .stream()
                .map(OrganizacionesMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrganizacionResponseDto getEmpresaMatriz(Long id) {
        Organizacion matriz = getEntity(id).getEmpresaMatriz();
        return matriz != null ? OrganizacionesMapper.toDto(matriz) : null;
    }

    @Override
    public OrganizacionResponseDto addProyecto(Long orgId, Long proyectoId) {
        var org = getEntity(orgId);
        var proyecto = proyectosRepository.findById(proyectoId).orElseThrow();

        proyecto.setOrganizacion(org);
        org.getProyectos().add(proyecto);

        return OrganizacionesMapper.toDto(repository.save(org));
    }

    @Override
    public OrganizacionResponseDto addUsuario(Long orgId, Long usuarioId) {
        var org = getEntity(orgId);
        var usuario = usuariosRepository.findById(usuarioId).orElseThrow();

        usuario.setOrganizacion(org);
        org.getUsuarios().add(usuario);

        return OrganizacionesMapper.toDto(repository.save(org));
    }

    @Override
    @Transactional
    public OrganizacionResponseDto addDirector(Long orgId, Long usuarioId) {
        Organizacion org = getEntity(orgId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        if (!org.getAdmin().getId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el admin principal puede añadir directores");
        }

        Usuario nuevoDirector = usuariosRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFound(usuarioId.toString()));

        if (!org.getDirectores().contains(nuevoDirector)) {
            nuevoDirector.getRoles().add(Roles.DIRECTOR);
            usuariosRepository.save(nuevoDirector);
            org.getDirectores().add(nuevoDirector);
        }

        return OrganizacionesMapper.toDto(repository.save(org));
    }

    @Override
    @Transactional
    public void asignarRolEnOrg(Long orgId, Long usuarioId, Roles rol) {
        Organizacion org = getEntity(orgId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        boolean esAdmin = org.getAdmin().getId().equals(caller.getId());
        boolean esDirectorEnOrg = usuarioOrgRolRepository
                .existsByUsuarioIdAndOrganizacionIdAndRol(caller.getId(), orgId, Roles.DIRECTOR);

        if (!esAdmin && !esDirectorEnOrg) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un director de esta organización puede asignar roles");
        }

        Usuario usuario = usuariosRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFound(usuarioId.toString()));

        usuarioOrgRolRepository.deleteByUsuarioIdAndOrganizacionId(usuarioId, orgId);
        usuarioOrgRolRepository.save(UsuarioOrgRol.builder()
                .usuario(usuario)
                .organizacion(org)
                .rol(rol)
                .build());

        log.info("Rol {} asignado al usuario {} en org {}", rol, usuarioId, orgId);
    }

    @Override
    public List<UsuarioResponseDto> getMiembros(Long orgId) {
        return getEntity(orgId).getUsuarios()
                .stream()
                .map(usuariosMapper::toUsuarioResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrganizacionResponseDto removeDirector(Long orgId, Long usuarioId) {
        Organizacion org = getEntity(orgId);
        Usuario caller = authUtils.getUsuarioAuthentication(usuariosRepository);

        if (!org.getAdmin().getId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el admin principal puede eliminar directores");
        }

        if (org.getAdmin().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar al admin principal de la lista de directores");
        }

        org.getDirectores().removeIf(u -> u.getId().equals(usuarioId));
        return OrganizacionesMapper.toDto(repository.save(org));
    }
}
