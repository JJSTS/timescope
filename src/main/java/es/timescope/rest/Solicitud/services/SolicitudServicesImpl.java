package es.timescope.rest.Solicitud.services;

import es.timescope.rest.Solicitud.dto.SolicitudResponseDto;
import es.timescope.rest.Solicitud.exceptions.EmisorAndReceptorEquals;
import es.timescope.rest.Solicitud.exceptions.EmisorOrReceptorNotFound;
import es.timescope.rest.Solicitud.exceptions.SolicitudExist;
import es.timescope.rest.Solicitud.exceptions.SolicitudNotFound;
import es.timescope.rest.Solicitud.mappers.SolicitudMapper;
import es.timescope.rest.Solicitud.models.Estado;
import es.timescope.rest.Solicitud.models.Solicitud;
import es.timescope.rest.Solicitud.repositories.SolicitudRepository;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.stereotype.Service;

import java.util.List;

@CacheConfig(cacheNames = {"solicitud"})
@Service
@Slf4j
@RequiredArgsConstructor
public class SolicitudServicesImpl implements SolicitudServices {

    private final SolicitudRepository solicitudRepository;
    private final UsuariosRepository usuariosRepository;
    private final SolicitudMapper solicitudMapper;

    @Override
    public SolicitudResponseDto enviarSolicitud(Long emisorId, Long receptorId) {
        log.info("Solicitud enviada de {} a {}", emisorId, receptorId);
        if(emisorId.equals(receptorId)) {throw new EmisorAndReceptorEquals();}

        if (solicitudRepository.existsByEmisorIdAndReceptorIdAndEstado(emisorId, receptorId, Estado.PENDIENTE)) {throw new SolicitudExist();}

        Usuario emisor = usuariosRepository.findById(emisorId).orElseThrow(() -> new EmisorOrReceptorNotFound("Emisor no encontrado"));

        Usuario receptor = usuariosRepository.findById(receptorId).orElseThrow(() -> new EmisorOrReceptorNotFound("Receptor no encontrado"));
        Solicitud solicitud = Solicitud.builder()
                .emisor(emisor)
                .receptor(receptor)
                .build();

        solicitudRepository.save(solicitud);
        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public SolicitudResponseDto aceptarSolicitud(Long id, Long receptorId) {
        log.info("Aceptando solicitud de {} a {}", id, receptorId);

        Solicitud solicitud = validarSolicitud(id, receptorId);
        solicitud.setEstado(Estado.ACEPTADA);
        solicitudRepository.save(solicitud);
        log.info("Solicitud aceptada");
        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public SolicitudResponseDto rechazarSolicitud(Long id, Long receptorId) {
        return null;
    }

    @Override
    public void cancelarSolicitud(Long solicitudId, Long emisorId) {

    }

    @Override
    public List<SolicitudResponseDto> verSolicitudesPendientes(Long receptorId) {
        return List.of();
    }

    public Solicitud validarSolicitud(Long id, Long receptorId) {
        Solicitud solicitud = solicitudRepository.findById(id).orElseThrow(() -> new SolicitudNotFound());

        if (!solicitud.getReceptor().getId().equals(receptorId)) throw new EmisorOrReceptorNotFound("No tienes permiso sobre esta solicitud");
        if (solicitud.getEstado() != Estado.PENDIENTE) throw new SolicitudExist();

        return solicitud;

    }
}
