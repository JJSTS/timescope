package es.timescope.rest.Usuarios.repositories;

import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tarea t WHERE t.usuario.id = :id")
    Boolean existsTareasByUsuarioId(Long id);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Proyecto p JOIN p.usuarios u WHERE u.id = :id")
    Boolean existsProyectosByUsuarioId(Long id);

    @Query("UPDATE Usuario u SET u.rol = :rol WHERE u.id = :id")
    @Modifying
    void asingRolUsuario(Long id, Roles rol);

    Usuario findByUsernameIgnoreCase (String username);

    Usuario findByNombres(String nombres);
}
