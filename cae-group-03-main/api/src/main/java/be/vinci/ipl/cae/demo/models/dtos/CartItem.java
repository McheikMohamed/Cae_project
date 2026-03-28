package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AddToCartRequest DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {
  private Batch batch;
  private int quantity;
}
