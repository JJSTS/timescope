package es.timescope.rest.Solicitud.controllers;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;
import es.timescope.rest.Solicitud.services.SolicitudServices;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("api/${api.version}/solicitud")
@RequiredArgsConstructor
public class SolicitudRestController {

    private final SolicitudServices solicitudServices;

    @PostMapping("/enviar/{organizacion}")
    public ResponseEntity<SolicitudResponseDto> enviarSolicitud (@PathVariable String organizacion) {
        log.info("Enviando solicitud a {}", organizacion);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitudServices.enviarSolicitud(organizacion));
    }

    @PutMapping("/{id}/aceptar")
    public ResponseEntity<SolicitudResponseDto> aceptarSolicitud (@PathVariable Long id) {
        log.info("Aceptando solicitud");
        return ResponseEntity.ok(solicitudServices.aceptarSolicitud(id));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudResponseDto> rechazarSolicitud(@PathVariable Long id) {
        log.info("Rechazando solicitud");
        return ResponseEntity.ok(solicitudServices.rechazarSolicitud(id));
    }

    @DeleteMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarSolicitud(@PathVariable Long id) {
        log.info("Cancelando solicitud a {}", id);
        solicitudServices.cancelarSolicitud(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendientes/{organizacionId}")
    public ResponseEntity<List<SolicitudResponseDto>> getPendientes(@PathVariable Long organizacionId) {
        log.info("Devolviendo solicitudes pendientes");
        return ResponseEntity.ok(solicitudServices.solicitudesPendientes(organizacionId));
    }

    @GetMapping("/mis-pendientes")
    public ResponseEntity<List<SolicitudResponseDto>> getMisPendientes() {
        log.info("Devolviendo mis solicitudes pendientes");
        return ResponseEntity.ok(solicitudServices.misSolicitudesPendientes());
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
