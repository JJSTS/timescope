package es.timescope.rest.Usuarios.repositories;

import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.UsuarioOrgRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioOrgRolRepository extends JpaRepository<UsuarioOrgRol, Long> {

    List<UsuarioOrgRol> findByUsuarioIdAndOrganizacionId(Long usuarioId, Long orgId);

    boolean existsByUsuarioIdAndOrganizacionIdAndRol(Long usuarioId, Long orgId, Roles rol);

    @Modifying
    @Query("DELETE FROM UsuarioOrgRol u WHERE u.usuario.id = :usuarioId AND u.organizacion.id = :orgId")
    void deleteByUsuarioIdAndOrganizacionId(Long usuarioId, Long orgId);
}
