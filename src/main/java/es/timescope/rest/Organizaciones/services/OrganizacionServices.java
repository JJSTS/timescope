package es.timescope.rest.Organizaciones.services;
import es.timescope.rest.Organizaciones.dto.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface OrganizacionServices {

    Page<OrganizacionResponseDto> findAll(Optional<Long> id, Optional<String> nombre,Optional<Boolean> isDeleted, Pageable pageable);

    OrganizacionResponseDto create(OrganizacionCreateDto dto);

    void delete(Long id);

    List<OrganizacionResponseDto> getFiliales(Long id);

    OrganizacionResponseDto getEmpresaMatriz(Long id);

    OrganizacionResponseDto addProyecto(Long orgId, Long proyectoId);

    OrganizacionResponseDto addUsuario(Long orgId, Long usuarioId);

    OrganizacionResponseDto cederAdmin(Long orgId, String username);

    OrganizacionResponseDto addDirector(Long orgId, Long usuarioId);

    OrganizacionResponseDto removeDirector(Long orgId, Long usuarioId);

    void asignarRolEnOrg(Long orgId, Long usuarioId, es.timescope.rest.Usuarios.models.Roles rol);
}