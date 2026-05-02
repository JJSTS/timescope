package es.timescope.rest.Organizaciones.repositories;

import es.timescope.rest.Organizaciones.models.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OrganizacionesRepository extends JpaRepository<Organizacion, Long>, JpaSpecificationExecutor<Organizacion> {
}