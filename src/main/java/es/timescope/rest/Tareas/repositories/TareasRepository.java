package es.timescope.rest.Tareas.repositories;

import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Tareas.models.Estado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareasRepository extends JpaRepository<Tarea, Long>, JpaSpecificationExecutor<Tarea> {

    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId")
    List<Tarea> findByUsuarioId(Long usuarioId);

    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId")
    Page<Tarea> findByUsuarioId(Long usuarioId, Pageable pageable);
    
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.estado = :estado")
    List<Tarea> findByUsuarioIdAndEstado(Long usuarioId, Estado estado);

    @Query("SELECT t FROM Tarea t WHERE t.proyecto.id = :proyectoId")
    List<Tarea> findByProyectoId(Long proyectoId);

    @Query("SELECT t FROM Tarea t WHERE t.proyecto.id = :proyectoId")
    Page<Tarea> findByProyectoId(Long proyectoId, Pageable pageable);
}
