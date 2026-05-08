package es.timescope.rest.Usuarios.models;

import es.timescope.rest.Organizaciones.models.Organizacion;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "USUARIO_ORG_ROL",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "org_id", "rol"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioOrgRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organizacion organizacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles rol;
}
