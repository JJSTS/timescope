package es.timescope.rest.Notificacion.controller;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Notificacion.dto.NotificacionResponseDto;
import es.timescope.rest.Notificacion.models.Notificacion;
import es.timescope.rest.Notificacion.service.NotificacionService;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/${api.version}/notificaciones")
public class NotificacionRestController {
    private final NotificacionService notificacionService;
    private final UsuariosRepository usuariosRepository;
    private final AuthUtils authUtils;

    @GetMapping("/pendientes")
    public ResponseEntity<List<NotificacionResponseDto>> getPendientes() {
        Usuario usuario = authUtils.getUsuarioAuthentication(usuariosRepository);
        return ResponseEntity.ok(notificacionService.noticiacionesPendientes(usuario.getId()));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<NotificacionResponseDto>> allNotificaciones() {
        Usuario usuario = authUtils.getUsuarioAuthentication(usuariosRepository);
        return ResponseEntity.ok(notificacionService.todasNotificaciones(usuario.getId()));
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Void> marcarLeido(@PathVariable Long id) {
        notificacionService.marcarLeido(id);
        return ResponseEntity.noContent().build();
    }
}
