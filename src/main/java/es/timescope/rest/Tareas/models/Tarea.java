package es.timescope.rest.Tareas.models;

import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Setter
@Table(name = "TAREAS")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Estado estado = Estado.ACTIVO;

    @Builder.Default
    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @ManyToOne(fetch =  FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
