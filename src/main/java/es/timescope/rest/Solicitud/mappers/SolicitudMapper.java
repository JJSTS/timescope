package es.timescope.rest.Solicitud.mappers;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;
import es.timescope.rest.Solicitud.models.Solicitud;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SolicitudMapper {
    public SolicitudResponseDto toResponseDto(Solicitud solicitud) {
        return SolicitudResponseDto.builder()
                .id(solicitud.getId())
                .usuario(solicitud.getUsuario().getUsername())
                .organizacion(solicitud.getOrganizacion().getNombre())
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
