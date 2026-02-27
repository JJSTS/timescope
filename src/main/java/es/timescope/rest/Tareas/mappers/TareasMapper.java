package es.timescope.rest.Tareas.mappers;

import es.timescope.rest.Tareas.dto.TareaCreateDto;
import es.timescope.rest.Tareas.dto.TareaUpdateDto;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Usuarios.models.Usuario;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TareasMapper {

    public Tarea toTarea(TareaCreateDto tareaCreateDto, Usuario usuario) {
        return Tarea.builder()
                .id(null)
                .nombre(tareaCreateDto.getNombre())
                .descripcion(tareaCreateDto.getDescripcion())
                .fechaCreacion(LocalDateTime.now())
                .build();

    }
//
//    public Tarea toTarea(TareaUpdateDto tareaUpdateDto, Tarea tarea) {
//        return Tarea.builder()
//                .id(tarea.getId())
//                .nombre(tareaUpdateDto.getNombre() != null ? tareaUpdateDto.getNombre() : tarea.getNombre())
//
//
//    }


}
