package es.timescope.rest.Solicitud.models;

import es.timescope.rest.Organizaciones.models.Organizacion;
import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Entity
@Table(name = "SOLICITUD")
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emisor_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizacion_id")
    private Organizacion organizacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "estado")
    @Builder.Default
    private Estado estado = Estado.PENDIENTE;

    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime fechaCreacion =  LocalDateTime.now();
}
