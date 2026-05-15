package es.timescope.rest.Notificacion.models;

import es.timescope.rest.Usuarios.models.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "NOTIFICACIONES")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default()
    private Boolean leido = false;

    @Column
    private Long solicitudId;

    @Builder.Default
    @Column(updatable = false, nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreada = LocalDateTime.now();
}