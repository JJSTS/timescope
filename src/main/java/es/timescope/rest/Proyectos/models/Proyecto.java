package es.timescope.rest.Proyectos.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Tareas.models.Tarea;
import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Builder
@ToString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table (name = "PROYECTOS")
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false,  length = 20)
    private String nombre;

    @Column(nullable = false,  length = 300)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;

    @ManyToMany()
    @JoinTable(
        name = "proyecto_usuario",
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    @JsonIgnoreProperties("proyectos") // Solo si se va a pasar a json si no, quitar
    @ToString.Exclude
    private List<Usuario> usuarios;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "organizacion_id")
    @JsonIgnore
    private Organizacion organizacion;

    @OneToMany(mappedBy = "proyecto")
    @JsonIgnoreProperties("proyecto")
    @ToString.Exclude
    private List<Tarea> tareas;
}
