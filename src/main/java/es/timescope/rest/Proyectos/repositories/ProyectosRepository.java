package es.timescope.rest.Proyectos.repositories;

import es.timescope.rest.Proyectos.models.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectosRepository extends JpaRepository<Proyecto, Long>, JpaSpecificationExecutor<Proyecto> {
    @Query("SELECT p FROM Proyecto p WHERE p.estado = :estado")
    Page<Proyecto> findByEstado(Estado estado, Pageable pageable);

    @Query("SELECT p FROM Proyecto p JOIN Usuario u WHERE u.id = :usuarioId")
    Page<Proyecto> findByUsuarioId(Long usuarioId, Pageable pageable);
}
