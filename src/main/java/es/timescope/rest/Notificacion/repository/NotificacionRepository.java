package es.timescope.rest.Notificacion.repository;

import es.timescope.rest.Notificacion.models.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long>, JpaSpecificationExecutor<Notificacion> {
    @Query("SELECT n FROM Notificacion n WHERE n.usuario.id = :usuarioId and n.leido = false")
    List<Notificacion> findByUsuarioIdAndLeidoFalse(Long usuarioId);

    @Query("SELECT n FROM Notificacion n WHERE n.usuario.id = :usuarioId")
    List<Notificacion> findByUsuarioId(Long usuarioId);
}