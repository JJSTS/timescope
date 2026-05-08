package es.timescope.rest.Tareas.controllers;

import es.timescope.rest.Tareas.dto.TareaAddDto;
import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaResponseDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.mappers.TareasMapper;
import es.timescope.rest.Tareas.models.Estado;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Tareas.services.TareasServices;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.utils.pagination.PageResponse;
import es.timescope.utils.pagination.PaginationLinksUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/tareas")
public class TareasRestController {
    private final TareasServices tareasServices;
    private final PaginationLinksUtils paginationLinksUtils;

    @GetMapping()
    public ResponseEntity<PageResponse<TareaResponseDto>> getAll(
            @RequestParam(required = false) Optional<String> usuario,
            @RequestParam(required = false) Optional<String> estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            HttpServletRequest request
    ) {
        log.info("Buscando todos los titulares con usuario={} estado={}", usuario, estado);
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(request.getRequestURL().toString());
        Page<TareaResponseDto> pageResult = tareasServices.findAll(usuario, estado, pageable);
        return ResponseEntity.ok()
                .header("link", paginationLinksUtils.createLinkHeader(pageResult, uriBuilder))
                .body(PageResponse.of(pageResult, sortBy, direction));

    }

    @GetMapping("/me")
    public ResponseEntity<List<TareaResponseDto>> getTasksByUser(@AuthenticationPrincipal Usuario usuario){
        log.info("Obteniendo tareas del usuario: {}", usuario.getUsername());
        List<TareaResponseDto> tareasMapeadas = tareasServices.findByUsuarioId(usuario.getId());
        return ResponseEntity.ok(tareasMapeadas);
    }

    @GetMapping("/me/activo")
    public ResponseEntity<List<TareaResponseDto>> getTasksByUserActivo(){
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            
            if (!(principal instanceof Usuario)) {
                log.error("Principal no es una instancia de Usuario");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
            }
            
            Usuario usuario = (Usuario) principal;
            log.info("Obteniendo tareas activas y abiertas del usuario: {}", usuario.getUsername());
            
            List<TareaResponseDto> tareas = new ArrayList<>();
            tareas.addAll(tareasServices.findByUsuarioIdAndEstado(usuario.getId(), Estado.ACTIVO));
            tareas.addAll(tareasServices.findByUsuarioIdAndEstado(usuario.getId(), Estado.ABIERTO));
            
            log.info("Total de tareas obtenidas: {}", tareas.size());
            return ResponseEntity.ok(tareas);
        } catch (Exception e) {
            log.error("Error al obtener tareas activas y abiertas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TareaResponseDto> getById(@PathVariable Long id) {
        log.info("Buscando el id de tarea con id: {}", id);
        return ResponseEntity.ok(tareasServices.findById(id));
    }

    @PostMapping()
    public ResponseEntity<TareaResponseDto> createTarea(
            @Valid @RequestBody TareaCreateDto tareaCreateDto){
        log.info("Creando tarea: {}", tareaCreateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(tareasServices.createTarea(tareaCreateDto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TareaResponseDto> updateTarea(@PathVariable Long id, @Valid @RequestBody TareaUpdateDto tareaUpdateDto) {
        log.info("Actualizando tarea con id: {}, datos: {}", id, tareaUpdateDto);
        return ResponseEntity.ok(tareasServices.updateTarea(id, tareaUpdateDto));
    }

    @PostMapping("/addTarea")
    @PreAuthorize("hasAnyRole('DIRECTOR','COORDINADOR','LIDER')")
    public ResponseEntity<TareaResponseDto> addTarea(@Valid @RequestBody TareaAddDto tareaAddDto) {
        log.info("Asignando tarea id: {} al usuario: {}", tareaAddDto.getTareaId(), tareaAddDto.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(tareasServices.addTarea(tareaAddDto));
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        BindingResult result = ex.getBindingResult();
        problemDetail.setDetail("Falló la validación para el objeto='" + result.getObjectName()
                + "'. " + "Núm. errores: " + result.getErrorCount());

        Map<String, String> errores = new HashMap<>();
        result.getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errores.put(fieldName, errorMessage);
        });

        problemDetail.setProperty("errores", errores);
        return problemDetail;
    }
}
