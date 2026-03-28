package be.vinci.ipl.cae.demo.models.dtos;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewReservation DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewReservation {

  private NewUser client;

  private Date recoveryDate;

  private String status;
}
