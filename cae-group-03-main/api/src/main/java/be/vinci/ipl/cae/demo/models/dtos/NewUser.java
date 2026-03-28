package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewUser DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewUser {

  private String honorific;

  private String firstName;

  private String lastName;

  private String email;

  private String password;

  private String phoneNumber;

  private String role;

  public NewAddress address;

  private String company;


}
