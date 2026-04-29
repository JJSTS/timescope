package es.timescope.rest.auth.repositories;

import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthUsersRepository extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByUsername(String username);
}
