package es.timescope.rest.Proyectos.controllers;

import es.timescope.rest.Proyectos.dto.*;
import es.timescope.rest.Proyectos.models.Estado;
import es.timescope.rest.Proyectos.services.ProyectoServices;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.utils.pagination.PageResponse;
import es.timescope.utils.pagination.PaginationLinksUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/${api.version}/proyectos")
public class ProyectosRestController {
    private final ProyectoServices  proyectoServices;
    private final PaginationLinksUtils paginationLinksUtils;

    @GetMapping
    public ResponseEntity<PageResponse<ProyectoResponseDto>> findAll(
            @RequestParam(required = false) Optional<Long> id,
            @RequestParam(required = false)Optional<String> nombre,
            @RequestParam(required = false)Optional<Boolean> isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
    ){
        Sort sort = Sort.by(sortBy).ascending();
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());
        Page<ProyectoResponseDto> pageResult = proyectoServices.findAll(id, nombre, isDeleted, PageRequest.of(page, size, sort));

        log.info("findAll: id: {}, nombre: {}, isDeleted: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                id, nombre, isDeleted, page, size, sortBy, direction);
        if ("desc".equalsIgnoreCase(direction)) sort = Sort.by(sortBy).descending();

        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProyectoResponseDto> findById(@PathVariable Long id) {
        log.info("Buscando proyecto por id: {}", id);
        return ResponseEntity.ok(proyectoServices.findById(id));
    }

    @GetMapping("/{id}/miembros")
    public ResponseEntity<List<UsuarioResponseDto>> getMiembros(@PathVariable Long id) {
        log.info("Obteniendo miembros del proyecto con id: {}", id);
        return ResponseEntity.ok(proyectoServices.getMiembros(id));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<PageResponse<ProyectoResponseDto>> findByEstado(
            @PathVariable Estado estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
    ) {
        log.info("findByEstado: estado: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                estado, page, size, sortBy, direction);

        Sort sort = Sort.by(sortBy).ascending();
        if ("desc".equalsIgnoreCase(direction)) {
            sort = Sort.by(sortBy).descending();
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());

        Page<ProyectoResponseDto> pageResult = proyectoServices
                .findByEstado(estado, PageRequest.of(page, size, sort));

        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

    @PreAuthorize("hasRole('DIRECTOR')")
    @PostMapping
    public ResponseEntity<ProyectoResponseDto> createProyecto(@RequestBody ProyectoCreateDto proyectoCreateDto) {
        log.info("Recibiendo solicitud para crear proyecto: {}", proyectoCreateDto);
        ProyectoResponseDto proyecto = proyectoServices.save(proyectoCreateDto);
        return ResponseEntity.ok(proyecto);
    }


    @PutMapping("/usuario/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER')")
    public ResponseEntity<ProyectoResponseDto> addUsuario(
            @PathVariable Long id,
            @RequestParam String username
    ){
        log.info("Añadiendo usuario {} al proyecto {}", id, username);
        return ResponseEntity.ok(proyectoServices.addUsuario(id, username));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PageResponse<ProyectoResponseDto>> findByUsuarioId(
            @PathVariable Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
    ) {
        log.info("findByUsuarioId: usuarioId: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                usuarioId, page, size, sortBy, direction);

        Sort sort = Sort.by(sortBy).ascending();
        if ("desc".equalsIgnoreCase(direction)) {
            sort = Sort.by(sortBy).descending();
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());

        Page<ProyectoResponseDto> pageResult = proyectoServices
                .findByUsuarioId(usuarioId, PageRequest.of(page, size, sort));

        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER')")
    public ResponseEntity<ProyectoResponseDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Estado estado) {
        log.info("Cambiando estado del proyecto {} a {}", id, estado);
        return ResponseEntity.ok(proyectoServices.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER')")
    public ResponseEntity<Void> removeUsuario(
            @PathVariable Long id,
            @PathVariable Long usuarioId) {
        log.info("Eliminando usuario {} del proyecto {}", usuarioId, id);
        proyectoServices.removeUsuario(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER')")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        log.info("Eliminando proyecto con id: {}", id);

        proyectoServices.deleteById(id);

        return ResponseEntity.noContent().build(); // 204
    }
}