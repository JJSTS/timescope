package es.timescope.rest.Solicitud.services;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;

import java.util.List;

public interface SolicitudServices {

    SolicitudResponseDto enviarSolicitud(Long emisorId, Long receptorId);

    SolicitudResponseDto aceptarSolicitud(Long id, Long receptorId);

    SolicitudResponseDto rechazarSolicitud(Long id, Long receptorId);

    void cancelarSolicitud(Long solicitudId, Long emisorId);

    List<SolicitudResponseDto> verSolicitudesPendientes(Long receptorId);
}
