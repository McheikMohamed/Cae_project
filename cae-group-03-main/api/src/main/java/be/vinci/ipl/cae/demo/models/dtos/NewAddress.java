package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewAddress DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewAddress {

  private String street;

  private String number;

  private String box;

  private int postalCode;

  private String city;

  public NewCountry country;

}
