package es.timescope.rest.Solicitud.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCreatedDto {

    private String emisor;
    private String receptor;

}
