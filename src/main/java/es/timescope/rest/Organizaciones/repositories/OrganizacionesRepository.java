package es.timescope.rest.Organizaciones.repositories;

import es.timescope.rest.Organizaciones.models.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizacionesRepository extends JpaRepository<Organizacion, Long>, JpaSpecificationExecutor<Organizacion> {


    @Query("SELECT o FROM Organizacion o WHERE LOWER(o.nombre) = LOWER(:nombre)")
    Optional<Organizacion> findByNombreIgnoreCase(String nombre);
}