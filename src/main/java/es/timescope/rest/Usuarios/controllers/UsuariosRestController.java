package es.timescope.rest.Usuarios.controllers;

import es.timescope.rest.Usuarios.dto.UsuarioInfoResponse;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.dto.UsuarioUpdateDto;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.services.UsuariosService;
import es.timescope.utils.pagination.PageResponse;
import es.timescope.utils.pagination.PaginationLinksUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/usuarios")
public class UsuariosRestController {
    private final UsuariosService usuariosService;
    private final PaginationLinksUtils paginationLinksUtils;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponseDto> getMe() {
        log.info("Obteniendo datos del usuario autenticado");
        return ResponseEntity.ok(usuariosService.getMe());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioInfoResponse> findById(@PathVariable Long id) {
        log.info("Obteniendo usuario con id: {}", id);
        return ResponseEntity.ok(usuariosService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER')")
    public ResponseEntity<PageResponse<UsuarioResponseDto>> findAll(
            @RequestParam(required = false) Optional<String> username,
            @RequestParam(required = false) Optional<String> email,
            @RequestParam(required = false) Optional<Boolean> isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        log.info("findAll: username: {}, email: {}, isDeleted: {}, page: {}, size: {}, sortBy: {}, direction: {}",
                username, email, isDeleted, page, size, sortBy, direction);
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        UriComponentsBuilder uriBuilder = ServletUriComponentsBuilder.fromCurrentRequest();
        Page<UsuarioResponseDto> pageResult = usuariosService.findAll(username, email, isDeleted, PageRequest.of(page, size, sort));
        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));
    }

    @PatchMapping("/{id}/asingRol")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<?> assingRol(@PathVariable Long id, @RequestParam Roles role) {
        log.info("Asignado un Rol al usuario {}", id);
        usuariosService.asignarRol(id, role);
        return ResponseEntity.ok("Rol Asignado");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR','LIDER','DESARROLLADOR')")
    public ResponseEntity<UsuarioResponseDto> updatePartial(@PathVariable Long id, @RequestBody UsuarioUpdateDto usuarioUpdateDto) {
        log.info("Actualizando parcialmente usuario con id: {}", id);
        UsuarioResponseDto usuarioActualizado = usuariosService.updatePartial(id, usuarioUpdateDto);
        return ResponseEntity.ok(usuarioActualizado);
    }
}
