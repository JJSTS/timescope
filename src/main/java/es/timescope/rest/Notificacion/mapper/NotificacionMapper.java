package es.timescope.rest.Notificacion.mapper;

import es.timescope.rest.Notificacion.dto.NotificacionResponseDto;
import es.timescope.rest.Notificacion.models.Notificacion;
import es.timescope.rest.Notificacion.models.Tipo;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class NotificacionMapper {

    public Notificacion toNotificacion(Usuario usuario, String mensaje, Tipo tipo) {
        return toNotificacion(usuario, mensaje, tipo, null);
    }

    public Notificacion toNotificacion(Usuario usuario, String mensaje, Tipo tipo, Long solicitudId) {
        return Notificacion.builder()
                .usuario(usuario)
                .mensaje(mensaje)
                .tipo(tipo)
                .solicitudId(solicitudId)
                .leido(false)
                .fechaCreada(LocalDateTime.now())
                .build();
    }

    public NotificacionResponseDto toNotificacionResponseDto(Notificacion notificacion) {
        return NotificacionResponseDto.builder()
                .id(notificacion.getId())
                .username(notificacion.getUsuario().getUsername())
                .tipo(notificacion.getTipo())
                .mensaje(notificacion.getMensaje())
                .fecha(notificacion.getFechaCreada())
                .solicitudId(notificacion.getSolicitudId())
                .build();
    }

    public List<NotificacionResponseDto> toNotificacionResponseDtoList (List<Notificacion> notificaciones) {
        return notificaciones.stream()
                .map(this::toNotificacionResponseDto)
                .toList();
    }
}
