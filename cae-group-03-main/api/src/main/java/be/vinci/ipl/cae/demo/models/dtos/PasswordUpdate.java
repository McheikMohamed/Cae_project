package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PasswordUpdate DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordUpdate {

  private String email;

  private String oldPassword;

  private String newPassword;

  private String confirmPassword;

}
