package es.timescope.rest.Solicitud.repositories;

import es.timescope.rest.Solicitud.models.Estado;
import es.timescope.rest.Solicitud.models.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long>, JpaSpecificationExecutor<Solicitud> {
    Optional<Solicitud> findByEmisorIdAndReceptorId(Long emisorId, Long receptorId);

    List<Solicitud> findByReceptorIdAndEstado(Long receptorId, Estado estado);

    List<Solicitud> findByEmisorIdAndEstado(Long emisorId, Estado estado);

    boolean existsByEmisorIdAndReceptorIdAndEstado(Long emisorId, Long receptorId, Estado estado);
}
