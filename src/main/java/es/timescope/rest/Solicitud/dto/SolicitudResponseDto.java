package es.timescope.rest.Solicitud.dto;

import es.timescope.rest.Solicitud.models.Estado;
import es.timescope.rest.Usuarios.models.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudResponseDto {

    private Long id;
    private String usuario;
    private String organizacion;
    private Estado estado;
    private LocalDateTime fechaCreacion;
}
