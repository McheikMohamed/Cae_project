package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewPicture DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewPicture {

  private String address;

  private NewProduct product;

}
