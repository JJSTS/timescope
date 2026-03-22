package es.timescope.rest.Usuarios.controllers;

import es.timescope.rest.Proyectos.services.ProyectoServices;
import es.timescope.rest.Tareas.services.TareasServices;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.services.UsuariosService;
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
@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/usuarios")
//@PreAuthorize("hasRole('EMPLEADO')")
public class UsuariosRestController {
    private final UsuariosService usuariosService;
    private final PaginationLinksUtils paginationLinksUtils;
    private final ProyectoServices proyectoServices;
    private final TareasServices tareasServices;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('DIRECTOR','DESARROLLADOR')")
    public ResponseEntity<PageResponse<UsuarioResponseDto>> findAll(
            @RequestParam(required = false)Optional<String> username,
            @RequestParam(required = false)Optional<String> email,
            @RequestParam(required = false)Optional<Boolean> isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
            ) {
        log.info("findAll: username: {}, email: {}, isDeleted: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                username, email, isDeleted, page, size, sortBy, direction);
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());
        Page<UsuarioResponseDto> pageResult = usuariosService.findAll(username, email, isDeleted, PageRequest.of(page, size, sort));
        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

//    @PostMapping
//    public ResponseEntity<UsuarioResponseDto> addUsuario(){
//
//    }
}
