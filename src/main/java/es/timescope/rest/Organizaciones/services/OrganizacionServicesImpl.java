package es.timescope.rest.Organizaciones.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Organizaciones.dto.*;
import es.timescope.rest.Organizaciones.exceptions.OrganizacionNotFoundException;
import es.timescope.rest.Organizaciones.mappers.OrganizacionesMapper;
import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Organizaciones.repositories.OrganizacionesRepository;
import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizacionServicesImpl implements OrganizacionServices {

    private final OrganizacionesRepository repository;
    private final ProyectosRepository proyectosRepository;
    private final UsuariosRepository usuariosRepository;
    private final AuthUtils authUtils;

    private Organizacion getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new OrganizacionNotFoundException(id));
    }

    @Override
    public Page<OrganizacionResponseDto> findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable) {

        // Filtro por ID
        Specification<Organizacion> specId = (root, query, criteriaBuilder) ->
                id.map(i -> criteriaBuilder.equal(root.get("id"), i))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        // Filtro por nombre
        Specification<Organizacion> specNombre = (root, query, criteriaBuilder) ->
                nombre.map(n -> criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("nombre")),
                                "%" + n.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        // Filtro por isDeleted
        Specification<Organizacion> specIsDeleted = (root, query, criteriaBuilder) ->
                isDeleted.map(d -> criteriaBuilder.equal(root.get("isDeleted"), d))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        // Combinar criterios
        Specification<Organizacion> criterio = Specification.where(specId).and(specNombre).and(specIsDeleted);

        return repository.findAll(criterio, pageable).map(OrganizacionesMapper::toDto);
    }

    @Override
    public OrganizacionResponseDto create(OrganizacionCreateDto dto) {
        Usuario admin = authUtils.getUsuarioAuthentication(usuariosRepository);

        Organizacion org = new Organizacion();
        org.setNombre(dto.getNombre());
        org.setAdmin(admin);

        if (dto.getEmpresaMatrizId() != null) {
            org.setEmpresaMatriz(getEntity(dto.getEmpresaMatrizId()));
        }

        return OrganizacionesMapper.toDto(repository.save(org));
    }

    @Override
    public void delete(Long id) {
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
}