package es.timescope.rest.Usuarios.mappers;

import es.timescope.rest.Usuarios.dto.UsuarioCreateDto;
import es.timescope.rest.Usuarios.dto.UsuarioInfoResponse;
import es.timescope.rest.Usuarios.dto.UsuarioResponseDto;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UsuariosMapper {
    public Usuario toUsuario(UsuarioCreateDto usuario) {
        return Usuario.builder()
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .email(usuario.getEmail())
                .password(usuario.getPassword())
                .username(usuario.getUsername())
                .roles(usuario.getRoles())
                .isDeleted(usuario.getIsDeleted())
                .build();
    }
    
    public Usuario toUsuario(UsuarioCreateDto usuario, Long id) {
        return Usuario.builder()
                .id(id)
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .email(usuario.getEmail())
                .password(usuario.getPassword())
                .username(usuario.getUsername())
                .roles(usuario.getRoles())
                .isDeleted(usuario.getIsDeleted())
                .build();
    }
    
    public UsuarioResponseDto toUsuarioResponseDto(Usuario usuario) {
        return UsuarioResponseDto.builder()
                .id(usuario.getId())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .roles(usuario.getRoles())
                .isDeleted(usuario.getIsDeleted())
                .build();
    }

    public UsuarioInfoResponse toUsuarioInfoResponse(Usuario usuario, List<String> tareas, List<String> proyectos) {
        return UsuarioInfoResponse.builder()
                .id(usuario.getId())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .roles(usuario.getRoles())
                .isDeleted(usuario.getIsDeleted())
                .tareas(tareas)
                .proyectos(proyectos)
                .build();
    }
}
