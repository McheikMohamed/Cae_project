package be.vinci.ipl.cae.demo.models.dtos;

import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ReservstionRequest DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateReservationRequest {
  private List<NewBatch> cart;
  private Date date;
}
