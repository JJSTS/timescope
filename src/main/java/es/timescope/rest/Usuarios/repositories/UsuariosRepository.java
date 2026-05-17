package es.timescope.rest.Usuarios.repositories;

import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {
    Optional<Usuario> findByUsernameEqualsIgnoreCaseOrEmailEqualsIgnoreCase(String username, String email);

    Optional<Usuario> findByUsername(String username);

    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId")
    List<Tarea> findTareaByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Proyecto p JOIN p.usuarios u WHERE u.id = :id")
    List<Proyecto> findProyectoByUsuarioId(Long id);

    @Query("SELECT u FROM Usuario u WHERE u.organizacion.id = :orgId AND u.isDeleted = false")
    List<Usuario> findByOrganizacionId(Long orgId);

    Usuario findByNombres(String nombres);
}
