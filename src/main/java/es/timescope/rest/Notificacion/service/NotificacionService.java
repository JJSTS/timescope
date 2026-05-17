package es.timescope.rest.Notificacion.service;

import es.timescope.rest.Notificacion.dto.NotificacionResponseDto;
import es.timescope.rest.Notificacion.models.Tipo;

import java.util.List;

public interface NotificacionService {
    void enviarNotificacion(String username, String mensaje, Tipo tipo);
    void enviarNotificacion(String username, String mensaje, Tipo tipo, Long solicitudId);
    void marcarLeido(Long id);
    List<NotificacionResponseDto> noticiacionesPendientes(Long usuarioId);
    List<NotificacionResponseDto> todasNotificaciones(Long usuarioId);
}
