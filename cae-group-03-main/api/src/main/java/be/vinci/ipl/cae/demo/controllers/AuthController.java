package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.NewAddress;
import be.vinci.ipl.cae.demo.models.dtos.NewCountry;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.dtos.PasswordUpdate;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.CartService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthController to handle user authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final UserService userService;
  private final CartService cartService;

  /**
   * Constructor for AuthController.
   *
   * @param userService the injected UserService.
   */
  public AuthController(UserService userService, CartService cartService) {
    this.userService = userService;
    this.cartService = cartService;

  }

  /**
   * Check if the password update is invalid.
   *
   * @param passwordUpdate the password update
   * @return true if the password update is invalid, false otherwise.
   */
  private boolean isInvalidPasswordUpdate(PasswordUpdate passwordUpdate) {
    return passwordUpdate == null || passwordUpdate.getEmail() == null || passwordUpdate.getEmail()
            .isBlank() || passwordUpdate.getOldPassword() == null || passwordUpdate.getOldPassword()
            .isBlank() || passwordUpdate.getNewPassword() == null || passwordUpdate.getNewPassword()
            .isBlank();
  }

  /**
   * Check if the credentials are invalid.
   *
   * @param credentials the credentials
   * @return true if the credentials are invalid, false otherwise.
   */
  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null || credentials.getEmail() == null || credentials.getEmail().isBlank()
            || credentials.getPassword() == null || credentials.getPassword().isBlank();
  }

  /**
   * Check if the country is invalid.
   *
   * @param country the country
   * @return true if the country is invalid, false otherwise.
   */

  private boolean isInvalidCountry(NewCountry country) {
    return country == null || country.getName() == null || country.getName().isBlank();
  }

  /**
   * Check if the address is invalid.
   *
   * @param address the address
   * @return true if the address is invalid, false otherwise.
   */
  private boolean isInvalidAddress(NewAddress address) {
    return address == null || address.getStreet() == null || address.getStreet().isBlank()
            || address.getNumber() == null || address.getNumber().isBlank()
            || address.getPostalCode() == 0 || address.getCity() == null
            || address.getCity().isBlank()
            || address.getCountry() == null || isInvalidCountry(address.getCountry());
  }

  /**
   * Check if the new user is invalid.
   *
   * @param newUser the new user
   * @return true if the new user is invalid, false otherwise.
   */
  private boolean isInValidNewUser(NewUser newUser) {
    return newUser.getEmail() == null || newUser.getEmail().isBlank()
            || newUser.getFirstName() == null || newUser.getFirstName().isBlank()
            || newUser.getLastName() == null || newUser.getLastName().isBlank()
            || newUser.getPhoneNumber() == null || newUser.getPhoneNumber().isBlank()
            || newUser.getAddress() == null || isInvalidAddress(newUser.getAddress())
            || newUser.getPassword() == null || newUser.getPassword().isBlank()
            || newUser.getHonorific() == null || newUser.getHonorific().isBlank();
  }


  /**
   * Register a new user.
   *
   * @param user the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/register")
  public AuthenticatedUser register(@RequestBody NewUser user) {
    if (isInValidNewUser(user)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user data");
    }

    try {
      AuthenticatedUser newUser = userService.register(user.getHonorific(), user.getFirstName(),
              user.getLastName(), user.getEmail(), user.getPassword(), user.getPhoneNumber(),
              user.getRole(), user.getCompany(), user.getAddress().getStreet(),
              user.getAddress().getNumber(), user.getAddress().getBox(),
              user.getAddress().getPostalCode(), user.getAddress().getCity(),
              user.getAddress().getCountry().getName());

      if (newUser == null) {
        System.out.println("User registration conflict: " + user); // Log conflict
        throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
      }

      System.out.println("User registered successfully: " + newUser); // Log success
      return newUser;

    } catch (ResponseStatusException e) {
      System.out.println("User registration conflict: " + e.getMessage()); // Log the error
      throw e; // Re-throw the original ResponseStatusException
    } catch (Exception e) {
      System.err.println("Error during user registration: " + e.getMessage()); // Log the error
      e.printStackTrace(); // Print the stack trace
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
              "An error occurred during registration", e); // Pass 'e' as the cause
    }
  }

  /**
   * Login a user.
   *
   * @param credentials the user credentials from the request body
   * @return the authenticated user.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    if (isInvalidCredentials(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser user = userService.login(credentials.getEmail(), credentials.getPassword());

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  /**
   * Get user information.
   *
   * @param request the request
   * @return the user
   */
  @GetMapping("/account")
  @PreAuthorize("hasAnyRole('CLIENT', 'DEVELOPER', 'MANAGER', 'PRODUCER','BENEVOLE')")
  public User account(HttpServletRequest request) {
    return userService.getUser(request);
  }

  /**
   * Update Token.
   *
   * @param request the request
   * @return the new token
   * @throws ResponseStatusException if the token is invalid or user not found.
   */
  @PostMapping("/me")
  @PreAuthorize("hasAnyRole('CLIENT', 'DEVELOPER', 'MANAGER', 'PRODUCER','BENEVOLE')")
  public AuthenticatedUser me(HttpServletRequest request) {
    User user = userService.getUser(request);
    return userService.createJwtToken(user.getEmail());
  }

  /**
   * Update user password.
   *
   * @param passwordUpdate the password update request body
   * @return a JSON message on success
   * @throws ResponseStatusException if the password update is invalid or fails.
   */
  @PatchMapping("/updatePassword")
  @PreAuthorize("hasAnyRole('CLIENT', 'DEVELOPER', 'MANAGER', 'PRODUCER')")
  public ResponseEntity<String> updatePassword(@RequestBody PasswordUpdate passwordUpdate) {
    if (isInvalidPasswordUpdate(passwordUpdate)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    // New check for matching newPassword and confirmPassword
    if (!passwordUpdate.getNewPassword().equals(passwordUpdate.getConfirmPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
              "New password and confirmation do not match");
    }
    try {
      userService.updatePassword(passwordUpdate.getEmail(), passwordUpdate.getOldPassword(),
              passwordUpdate.getNewPassword());
      return ResponseEntity.ok("{\"message\":\"Password updated successfully\"}");
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
              "Error updating password", e);
    }
  }

  /**
   * Update user address.
   *
   * @param request    the request
   * @return a JSON message on success
   */
  @DeleteMapping("/emptyCart")
  @PreAuthorize("hasAnyRole('VOLUNTEER', 'DEVELOPER', 'MANAGER')")
  public ResponseEntity<String> emptyCart(HttpServletRequest request) {
    User user = userService.getUser(request);
    cartService.deleteCartByUser(user);
    return ResponseEntity.ok("{\"message\":\"Cart emptied successfully\"}");
  }


}
