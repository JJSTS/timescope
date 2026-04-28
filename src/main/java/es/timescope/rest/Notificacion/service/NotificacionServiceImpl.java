package es.timescope.rest.Notificacion.service;

import es.timescope.config.auth.AuthUtils;
import es.timescope.rest.Notificacion.dto.NotificacionResponseDto;
import es.timescope.rest.Notificacion.exception.NotificacionNotFound;
import es.timescope.rest.Notificacion.mapper.NotificacionMapper;
import es.timescope.rest.Notificacion.models.Notificacion;
import es.timescope.rest.Notificacion.models.Tipo;
import es.timescope.rest.Notificacion.repository.NotificacionRepository;
import es.timescope.rest.Usuarios.exceptions.UsuarioNotFound;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificacionRepository notificacionRepository;
    private final NotificacionMapper notificacionMapper;
    private final UsuariosRepository repositorioUsuarios;

    @Override
    public void enviarNotificacion(String username, String mensaje, Tipo tipo) {


        Usuario usuario = repositorioUsuarios.findByUsername(username).orElseThrow(() -> new UsuarioNotFound(username));
        Notificacion notificacion = notificacionMapper.toNotificacion(usuario, mensaje, tipo);

        notificacionRepository.save(notificacion);

        simpMessagingTemplate.convertAndSendToUser(
                username,
                "/queue/notificacion",
                mensaje);
    }

    @Override

    public void marcarLeido(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new NotificacionNotFound("Notificacion no encontrada"));
        notificacion.setLeido(true);
        notificacionRepository.save(notificacion);
    }

    @Override
    public List<NotificacionResponseDto> noticiacionesPendientes(Long usuarioId) {
        return notificacionMapper.toNotificacionResponseDtoList(
                notificacionRepository.findByUsuarioIdAndLeidoFalse(usuarioId)
        );
    }

    @Override
    public List<NotificacionResponseDto> todasNotificaciones(Long usuarioId) {
        return notificacionMapper.toNotificacionResponseDtoList(
                notificacionRepository.findByUsuarioId(usuarioId)
        );
    }
}

