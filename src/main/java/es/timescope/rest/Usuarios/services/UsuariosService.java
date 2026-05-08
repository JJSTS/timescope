package es.timescope.rest.Usuarios.services;

import es.timescope.rest.Usuarios.dto.UsuarioCreateDto;
import es.timescope.rest.Usuarios.dto.UsuarioInfoResponse;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.dto.UsuarioUpdateDto;
import es.timescope.rest.Usuarios.models.Roles;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UsuariosService {
    Page<UsuarioResponseDto> findAll(Optional<String> username, Optional<String> email, Optional<Boolean> isDeleted, Pageable pageable);

    UsuarioInfoResponse findById(Long id);

    UsuarioResponseDto update(Long id, UsuarioCreateDto userRequest);

    UsuarioResponseDto updatePartial(Long id, UsuarioUpdateDto userRequest);

    void asignarRol(Long id, Roles role);
}
