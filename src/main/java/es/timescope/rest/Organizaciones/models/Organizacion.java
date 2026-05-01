package es.timescope.rest.Organizaciones.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import es.timescope.rest.Proyectos.models.Proyecto;
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
@Table(name = "ORGANIZACION")
public class Organizacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombre;

    @OneToMany(mappedBy = "organizacion")
    @ToString.Exclude
    private List<Proyecto> proyectos;

    @OneToMany(mappedBy = "organizacion")
    @ToString.Exclude
    private List<Usuario> usuarios;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Usuario admin;

    @ManyToOne
    @JoinColumn(name = "empresa_matriz_id")
    @JsonIgnore
    @ToString.Exclude
    private Organizacion empresaMatriz;

    @OneToMany(mappedBy = "empresaMatriz")
    @ToString.Exclude
    private List<Organizacion> filiales;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isDeleted = false;
}
