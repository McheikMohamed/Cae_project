package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewReservationLine DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewReservationLine {

  private int quantity;

  private NewBatch batch;

}
