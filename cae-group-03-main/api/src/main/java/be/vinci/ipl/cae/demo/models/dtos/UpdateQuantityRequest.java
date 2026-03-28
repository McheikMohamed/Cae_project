package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UpdateQuantityRequest DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateQuantityRequest {
  private int quantity;
}
