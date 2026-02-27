package es.timescope.rest.Tareas.repositories;

import es.timescope.rest.Tareas.models.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareasRepository extends JpaRepository<Tarea, Long>, JpaSpecificationExecutor<Tarea> {


}
