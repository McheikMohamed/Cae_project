package be.vinci.ipl.cae.demo.models.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AddToCartRequest DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateReservationStatusRequest {
  public Long reservationId;
  public String status;
}
