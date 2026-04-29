package es.timescope.rest.Proyectos.services;

import es.timescope.rest.Proyectos.dto.ProyectoCreateDto;
import es.timescope.rest.Proyectos.dto.ProyectoResponseDto;
import es.timescope.rest.Proyectos.exceptions.ProyectoBadRequestException;
import es.timescope.rest.Proyectos.mappers.ProyectosMapper;
import es.timescope.rest.Proyectos.models.Estado;
import es.timescope.rest.Proyectos.models.Proyecto;
import es.timescope.rest.Proyectos.repositories.ProyectosRepository;
import es.timescope.rest.Proyectos.exceptions.ProyectoNotFoundException;
import es.timescope.rest.Usuarios.models.Usuario;
import es.timescope.rest.Usuarios.repositories.UsuariosRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@CacheConfig(cacheNames = {"proyectos"})
@Slf4j
@RequiredArgsConstructor
@Service
public class ProyectoServicesImpl implements ProyectoServices {
    private final ProyectosRepository proyectosRepository;
    private final UsuariosRepository usuariosRepository;
    private final ProyectosMapper proyectoMapper;

    @Override
    public Page<ProyectoResponseDto> findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable) {
        log.info("Buscando proyectos por id: {}, nombre: {} , isDeleted {}", id, nombre, isDeleted);

        // Búsqueda por ID (número del proyecto)
        Specification<Proyecto> specIdProyecto = (root, query, criteriaBuilder) ->
                id.map(i -> criteriaBuilder.equal(root.get("id"), i))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        // Búsqueda por nombre del proyecto
        Specification<Proyecto> specNombreProyecto = (root, query, criteriaBuilder) ->
                nombre.map(t -> criteriaBuilder.like(criteriaBuilder.lower(root.get("nombre")), "%" + t.toLowerCase() + "%"))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true))); // Si no hay nombre, no se filtra

        // Búsqueda por isDeleted (si está eliminado)
        Specification<Proyecto> specIsDeleted = (root, query, criteriaBuilder) ->
                isDeleted.map(d -> criteriaBuilder.equal(root.get("isDeleted"), d))
                        .orElseGet(() -> criteriaBuilder.isTrue(criteriaBuilder.literal(true)));

        Specification<Proyecto> criterio = Specification.where(specIdProyecto).and(specNombreProyecto).and(specIsDeleted);

        return proyectosRepository.findAll(criterio, pageable).map(proyectoMapper::toProyectoResponseDto);
    }

    @Override
    public Page<Proyecto> findByEstado(Estado estado, Pageable pageable) {
        log.info("Buscando proyectos por estado: {}", estado);
        return proyectosRepository.findByEstado(estado, pageable);
    }

    @Override
    public Page<ProyectoResponseDto> findByUsuarioId(Long usuarioId, Pageable pageable) {
        log.info("Obteniendo proyectos del usuario con id: {}", usuarioId);
        return proyectosRepository.findByUsuarioId(usuarioId, pageable)
                .map(proyectoMapper::toProyectoResponseDto);
    }

    @Override
    public ProyectoResponseDto save(ProyectoCreateDto proyectoCreateDto) {
        log.info("Guardando proyecto: {}", proyectoCreateDto);
        List<Usuario> usuarios = checkUsuarios(proyectoCreateDto.getUsuarios());
        Proyecto proyectoSaved = proyectosRepository.save(proyectoMapper.toProyecto(proyectoCreateDto, usuarios));
        return proyectoMapper.toProyectoResponseDto(proyectoSaved);
    }

    @Override
    public void deleteById(Long id) {
        // Si no existe lanza excepción
        proyectosRepository.findById(id).orElseThrow(() -> new ProyectoNotFoundException(id));
        proyectosRepository.deleteById(id);
    }

    private List<Usuario> checkUsuarios(List<Long> usuariosIds) {
        log.info("Buscando usuarios por id: {}", usuariosIds);
        if (usuariosIds == null) return new ArrayList<>();
        List<Usuario> usuarios = new ArrayList<>();
        for (Long id : usuariosIds) {
            var usuario = usuariosRepository.findById(id).orElse(null);
            if (usuario == null || usuario.getIsDeleted()) {
                throw new ProyectoBadRequestException("El usuario con id: " + id + " no existe o está borrado");
            }
            usuarios.add(usuario);
        }
        return usuarios;
    }
}
