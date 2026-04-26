package es.timescope.rest.Notificacion.controller;

import es.timescope.rest.Notificacion.models.Notificacion;
import es.timescope.rest.Notificacion.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/notificaciones")
public class NotificacionRestController {
    private final NotificacionService notificacionService;

//    @GetMapping("/pendientes")
//    public ResponseEntity<List<Notificacion>> getPendientes() {
//        return ResponseEntity.ok(notificacionService.noticiacionesPendientes())
//    }
}
