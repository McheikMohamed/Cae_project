package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewProduct DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewProduct {

  private String name;

  private String description;

  private NewProductType productType;

  private NewUnit unit;

}
