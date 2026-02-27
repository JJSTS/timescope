package es.timescope.rest.Proyectos.repositories;

import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProyectosRepository {
    @Query("SELECT u FROM Proyecto p JOIN p.usuarios u WHERE p.id = :proyectoId")
    List<Usuario> findUsuariosByProyectoId(Long id);
}
