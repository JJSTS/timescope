package es.timescope.rest.Solicitud.services;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;

import java.util.List;

public interface SolicitudServices {

    SolicitudResponseDto enviarSolicitud(String organizacionNombre);

    SolicitudResponseDto aceptarSolicitud(Long id);

    SolicitudResponseDto rechazarSolicitud(Long id);

    void cancelarSolicitud(Long id);

    List<SolicitudResponseDto> solicitudesPendientes(Long organizacionId);
}
