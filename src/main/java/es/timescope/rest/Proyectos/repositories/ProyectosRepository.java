package es.timescope.rest.Proyectos.repositories;

import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectosRepository extends JpaRepository<Proyecto, Long>, JpaSpecificationExecutor<Proyecto> {
    @Query("SELECT u FROM Proyecto p JOIN p.usuarios u WHERE p.id = :proyectoId")
    List<Usuario> findUsuariosByProyectoId(Long id);
}
