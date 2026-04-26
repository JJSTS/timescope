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
    public SolicitudResponseDto enviarSolicitud(String username) {
        log.info("Solicitud enviada a {}", username );
        Usuario emisor = usuariosRepository.findByUsername(username).orElseThrow(() -> new EmisorOrReceptorNotFound(username));
        if(emisor.getUsername().equals(username)) {throw new EmisorAndReceptorEquals();}

        if (solicitudRepository.existsByEmisorIdAndReceptorIdAndEstado(emisor.getId(), emisor.getId(), Estado.PENDIENTE)) {throw new SolicitudExist();}

        Usuario receptor = usuariosRepository.findById(emisor.getId()).orElseThrow(() -> new EmisorOrReceptorNotFound("Emisor no encontrado"));

        Usuario emisors = usuariosRepository.findById(receptor.getId()).orElseThrow(() -> new EmisorOrReceptorNotFound("Receptor no encontrado"));
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
        log.info("Solicitud rechazada");
        Solicitud solicitud = validarSolicitud(id, receptorId);
        solicitud.setEstado(Estado.RECHAZADA);
        solicitudRepository.save(solicitud);
        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public void cancelarSolicitud(Long id, Long emisorId) {
        Solicitud solicitud = solicitudRepository.findById(id).orElseThrow(() -> new SolicitudNotFound());
        validarSolicitud(emisorId, emisorId);
        solicitudRepository.delete(solicitud);
        log.info("Solicitud cancelada");
    }

    @Override
    public List<SolicitudResponseDto> solicitudesPendientes(Long receptorId) {
        return solicitudMapper.toResponseDtoList(
                solicitudRepository.findByReceptorIdAndEstado(receptorId, Estado.PENDIENTE)
        );
    }

    public Solicitud validarSolicitud(Long id, Long receptorId) {
        Solicitud solicitud = solicitudRepository.findById(id).orElseThrow(() -> new SolicitudNotFound());

        if (!solicitud.getReceptor().getId().equals(receptorId)) throw new EmisorOrReceptorNotFound("No tienes permiso sobre esta solicitud");
        if (solicitud.getEstado() != Estado.PENDIENTE) throw new SolicitudExist();

        return solicitud;

    }
}
