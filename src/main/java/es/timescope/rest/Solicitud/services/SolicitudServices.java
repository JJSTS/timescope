package es.timescope.rest.Solicitud.services;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;

import java.util.List;

public interface SolicitudServices {

    SolicitudResponseDto enviarSolicitud(String username);

    SolicitudResponseDto aceptarSolicitud(Long id, Long receptorId);

    SolicitudResponseDto rechazarSolicitud(Long id, Long receptorId);

    void cancelarSolicitud(Long id);

    List<SolicitudResponseDto> solicitudesPendientes(Long receptorId);
}
