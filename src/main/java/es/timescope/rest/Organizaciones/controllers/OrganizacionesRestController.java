package es.timescope.rest.Organizaciones.controllers;

import es.timescope.rest.Organizaciones.dto.OrganizacionCreateDto;
import es.timescope.rest.Organizaciones.dto.OrganizacionResponseDto;
import es.timescope.rest.Organizaciones.services.OrganizacionServices;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.utils.pagination.PaginationLinksUtils;
import es.timescope.utils.pagination.PageResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;


//Pongo todos los CONTROLLERS por si les encontramos algún uso, si no los quito antes de entregar
@RestController
@RequestMapping("api/${api.version}/organizaciones")
@RequiredArgsConstructor
@Slf4j
public class OrganizacionesRestController {

    private final OrganizacionServices service;
    private final PaginationLinksUtils paginationLinksUtils;

    @GetMapping
    public ResponseEntity<PageResponse<OrganizacionResponseDto>> findAll(
            @RequestParam(required = false) Optional<Long> id,
            @RequestParam(required = false) Optional<String> nombre,
            @RequestParam(required = false) Optional<Boolean> isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
    ) {
        Sort sort = Sort.by(sortBy).ascending();
        Page<OrganizacionResponseDto> result = service.findAll(id, nombre, isDeleted, PageRequest.of(page, size, sort));
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());

        log.info("findAll: id: {}, nombre: {}, isDeleted: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                id, nombre, isDeleted, page, size, sortBy, direction);
        if ("desc".equalsIgnoreCase(direction)) sort = Sort.by(sortBy).descending();

        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(result, uriBuilder))
                .body(PageResponse.of(result, sortBy, direction));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrganizacionResponseDto> create(@RequestBody OrganizacionCreateDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ceder-admin")
    public ResponseEntity<OrganizacionResponseDto> cederAdmin(
            @PathVariable Long id,
            @RequestParam String username) {
        log.info("Cediendo admin de org {} a {}", id, username);
        return ResponseEntity.ok(service.cederAdmin(id, username));
    }

    // 🔹 Filiales
    @GetMapping("/{id}/filiales")
    public ResponseEntity<?> getFiliales(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFiliales(id));
    }

    // 🔹 Empresa matriz
    @GetMapping("/{id}/matriz")
    public ResponseEntity<?> getMatriz(@PathVariable Long id) {
        return ResponseEntity.ok(service.getEmpresaMatriz(id));
    }

    // 🔹 Añadir proyecto
    @PostMapping("/{id}/proyectos/{proyectoId}")
    public ResponseEntity<OrganizacionResponseDto> addProyecto(
            @PathVariable Long id,
            @PathVariable Long proyectoId) {
        return ResponseEntity.ok(service.addProyecto(id, proyectoId));
    }

    // 🔹 Añadir usuario
    @PostMapping("/{id}/usuarios/{usuarioId}")
    public ResponseEntity<OrganizacionResponseDto> addUsuario(
            @PathVariable Long id,
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.addUsuario(id, usuarioId));
    }

    @PostMapping("/{id}/directores/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrganizacionResponseDto> addDirector(
            @PathVariable Long id,
            @PathVariable Long usuarioId) {
        log.info("Añadiendo director {} a org {}", usuarioId, id);
        return ResponseEntity.ok(service.addDirector(id, usuarioId));
    }

    @DeleteMapping("/{id}/directores/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrganizacionResponseDto> removeDirector(
            @PathVariable Long id,
            @PathVariable Long usuarioId) {
        log.info("Eliminando director {} de org {}", usuarioId, id);
        return ResponseEntity.ok(service.removeDirector(id, usuarioId));
    }

    @PatchMapping("/{orgId}/usuarios/{usuarioId}/rol")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> asignarRolEnOrg(
            @PathVariable Long orgId,
            @PathVariable Long usuarioId,
            @RequestParam Roles rol) {
        log.info("Asignando rol {} al usuario {} en org {}", rol, usuarioId, orgId);
        service.asignarRolEnOrg(orgId, usuarioId, rol);
        return ResponseEntity.noContent().build();
    }
}