package es.timescope.rest.Solicitud.repositories;

import es.timescope.rest.Solicitud.models.Estado;
import es.timescope.rest.Solicitud.models.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long>, JpaSpecificationExecutor<Solicitud> {
    List<Solicitud> findByOrganizacionIdAndEstado(Long organizacionId, Estado estado);
    boolean existsByUsuarioIdAndOrganizacionIdAndEstado(Long usuarioId, Long organizacionId, Estado estado);
}
