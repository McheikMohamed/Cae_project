package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ReservationUserRequest DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationUserRequest {
  private Reservation reservation;
  private String name;
  private String honorific;
}
