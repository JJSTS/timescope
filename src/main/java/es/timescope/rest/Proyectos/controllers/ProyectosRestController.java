package es.timescope.rest.Proyectos.controllers;

import es.timescope.rest.Proyectos.dto.ProyectoResponseDto;
import es.timescope.rest.Proyectos.services.ProyectoServices;
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

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/${api.version}/proyectos")
public class ProyectosRestController {
    private final ProyectoServices  proyectoServices;
    private final PaginationLinksUtils paginationLinksUtils;

    @GetMapping
//    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
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
        log.info("findAll: id: {}, nombre: {}, isDeleted: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                id, nombre, isDeleted, page, size, sortBy, direction);
        Sort sort = Sort.by(sortBy).ascending();
        if ("desc".equalsIgnoreCase(direction)) sort = Sort.by(sortBy).descending();
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());
        Page<ProyectoResponseDto> pageResult = proyectoServices.findAll(id, nombre, isDeleted, PageRequest.of(page, size, sort));
        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

    @PreAuthorize("hasAnyRole('DIRECTOR','COORDINADOR')")
    @PostMapping("/{id}/usuarios")
    public ResponseEntity<ProyectoResponseDto> addUsuario(
            @PathVariable Long id,
            @RequestParam String username
    ){
        log.info("Añadiendo usuario {} al proyecto {}", id, username);
        return ResponseEntity.ok(proyectoServices.addUsuario(id, username));
    }
}
