package es.timescope.rest.Solicitud.services;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Notificacion.models.Tipo;
import es.timescope.rest.Notificacion.service.NotificacionService;
import es.timescope.rest.Organizaciones.exceptions.OrganizacionNotFoundException;
import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Organizaciones.repositories.OrganizacionesRepository;
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
    private final OrganizacionesRepository organizacionRepository;
    private final NotificacionService notificacionService;

    private final SolicitudMapper solicitudMapper;
    private final AuthUtils authUtils;

    @Override
    public SolicitudResponseDto enviarSolicitud(String organizacionNombre) {
        log.info("Solicitud enviada a {}", organizacionNombre);

        Usuario usuario = authUtils.getUsuarioAuthentication(usuariosRepository);

        Organizacion organizacion = organizacionRepository.findByNombreIgnoreCase(organizacionNombre)
                .orElseThrow(() -> {
                    log.error("Organización no encontrada: {}", organizacionNombre);
                    return new OrganizacionNotFoundException(organizacionNombre);
                });

        if (solicitudRepository.existsByUsuarioIdAndOrganizacionIdAndEstado(usuario.getId(), organizacion.getId(), Estado.PENDIENTE)) {
            throw new SolicitudExist();
        }

        Solicitud solicitud = Solicitud.builder()
                .usuario(usuario)
                .organizacion(organizacion)
                .build();

        solicitudRepository.save(solicitud);

        notificacionService.enviarNotificacion(
                organizacion.getAdmin().getUsername(),
                usuario.getNombres()+ " " + usuario.getApellidos() + " ha enviado una solicitud para unirse!",
                Tipo.SOLICITUD_RECIBIDA
        );

        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public SolicitudResponseDto aceptarSolicitud(Long id) {
        log.info("Aceptando solicitud");

        Solicitud solicitud = validarSolicitud(id);
        solicitud.setEstado(Estado.ACEPTADA);

        Usuario usuario = solicitud.getUsuario();
        usuario.setOrganizacion(solicitud.getOrganizacion());
        usuariosRepository.save(usuario);
        solicitudRepository.save(solicitud);

        notificacionService.enviarNotificacion(
                solicitud.getUsuario().getUsername(),
                 "! " + solicitud.getOrganizacion().getNombre() + " ha aceptado la solicitud!",
                Tipo.SOLICITUD_ACEPTADA
        );

        log.info("Solicitud aceptada de {}",  solicitud.getUsuario().getUsername());
        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public SolicitudResponseDto rechazarSolicitud(Long id) {
        log.info("Solicitud rechazada");
        Solicitud solicitud = validarSolicitud(id);
        solicitud.setEstado(Estado.RECHAZADA);
        solicitudRepository.save(solicitud);

        notificacionService.enviarNotificacion(
                solicitud.getUsuario().getUsername(),
                solicitud.getOrganizacion().getNombre() + " ha rechazado la solicitud",
                Tipo.SOLICITUD_RECHAZADA
        );

        return solicitudMapper.toResponseDto(solicitud);
    }

    @Override
    public void cancelarSolicitud(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new SolicitudNotFound());

        Usuario usuarioAuth = authUtils.getUsuarioAuthentication(usuariosRepository);
        if (!solicitud.getUsuario().getId().equals(usuarioAuth.getId())) {
            throw new EmisorOrReceptorNotFound("No tienes permiso para cancelar esta solicitud");
        }

        if (solicitud.getEstado() != Estado.PENDIENTE) {
            throw new SolicitudExist();
        }

        solicitudRepository.delete(solicitud);
        log.info("Solicitud cancelada");
    }

    @Override
    public List<SolicitudResponseDto> solicitudesPendientes(Long organizacionId) {
        return solicitudMapper.toResponseDtoList(
                solicitudRepository.findByOrganizacionIdAndEstado(organizacionId, Estado.PENDIENTE)
        );
    }

    public Solicitud validarSolicitud(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id).orElseThrow(() -> new SolicitudNotFound());
        if (solicitud.getEstado() != Estado.PENDIENTE) throw new SolicitudExist();
        return solicitud;
    }
}
