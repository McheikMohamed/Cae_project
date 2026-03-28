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
public class AddToCartRequest {
  private Long idBatch;
  private int quantity;
}
