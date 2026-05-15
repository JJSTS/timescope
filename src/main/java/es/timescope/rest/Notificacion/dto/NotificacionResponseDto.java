package es.timescope.rest.Notificacion.dto;

import es.timescope.rest.Notificacion.models.Tipo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponseDto {

    private Long id;
    private String username;
    private Tipo tipo;
    private String mensaje;
    private LocalDateTime fecha;
    private Long solicitudId;
}
