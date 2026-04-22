package es.timescope.rest.Solicitud.mappers;

import es.timescope.rest.Solicitud.dto.SolicitudCreatedDto;
import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;
import es.timescope.rest.Solicitud.models.Estado;
import es.timescope.rest.Solicitud.models.Solicitud;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SolicitudMapper {
    public Solicitud toSolicitud( Usuario usuario1, Usuario usuario2) {
        return Solicitud.builder()
                .id(null)
                .emisor(usuario1)
                .receptor(usuario2)
                .estado(Estado.PENDIENTE)
                .fechaCreacion(LocalDateTime.now())
                .build();
    }

    public SolicitudResponseDto toResponseDto(Solicitud solicitud) {
        return SolicitudResponseDto.builder()
                .id(solicitud.getId())
                .emisor(solicitud.getEmisor().getUsername())
                .receptor(solicitud.getReceptor().getUsername())
                .estado(solicitud.getEstado())
                .fechaCreacion(solicitud.getFechaCreacion())
                .build();
    }

    public List<SolicitudResponseDto> toResponseDtoList(List<Solicitud> solicitud) {
        return solicitud.stream()
                .map(this::toResponseDto)
                .toList();
    }
}
