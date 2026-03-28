package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.dtos.PasswordUpdate;
import be.vinci.ipl.cae.demo.models.dtos.NewCountry;
import be.vinci.ipl.cae.demo.models.dtos.NewAddress;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

  @Mock
  private UserService userService;

  @InjectMocks
  private AuthController authController;

  @Test
  void login_InvalidCredentials_ThrowsBadRequest() {
    Credentials bad = new Credentials(null, "pwd");
    assertThrows(ResponseStatusException.class, () -> authController.login(bad));
  }

  @Test
  void login_UserNotFound_ThrowsUnauthorized() {
    Credentials creds = new Credentials("u@x.com", "pwd");
    when(userService.login("u@x.com", "pwd")).thenReturn(null);
    assertThrows(ResponseStatusException.class, () -> authController.login(creds));
  }

  @Test
  void login_Valid_ReturnsAuthenticatedUser() {
    Credentials creds = new Credentials("u@x.com", "pwd");
    AuthenticatedUser au = new AuthenticatedUser();
    au.setEmail("u@x.com");
    when(userService.login("u@x.com", "pwd")).thenReturn(au);

    AuthenticatedUser result = authController.login(creds);

    assertEquals("u@x.com", result.getEmail());
  }

  @Test
  void register_InvalidNewUser_ThrowsBadRequest() {
    NewUser nu = new NewUser(); // missing required fields
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> authController.register(nu));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Invalid user data", exception.getReason());
  }

  @Test
  void register_UserExists_ThrowsConflict() {
    // Crée un NewUser « valide » pour passer la validation des champs
    NewUser nu = new NewUser();
    nu.setHonorific("Mr");
    nu.setFirstName("X");
    nu.setLastName("Y");
    nu.setEmail("a@b.com");
    nu.setPassword("p");
    nu.setPhoneNumber("0123");
    nu.setRole("CLIENT");
    nu.setCompany("C");
    nu.setAddress(new NewAddress(
            "Rue", "1", "A", 1000, "Bruxelles",
            new NewCountry("Belgique")
    ));

    // Stub indispensable : si register retourne null, on doit lever un 409
    when(userService.register(
            eq("Mr"), eq("X"), eq("Y"), eq("a@b.com"),
            eq("p"), eq("0123"), eq("CLIENT"), eq("C"),
            eq("Rue"), eq("1"), eq("A"), eq(1000),
            eq("Bruxelles"), eq("Belgique")
    )).thenReturn(null);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> authController.register(nu));

    // Verify correct status code and message
    assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    assertEquals("User already exists", exception.getReason());

    // vérification qu'on a bien appelé userService.register
    verify(userService).register(
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyInt(),
            anyString(), anyString()
    );
  }

  @Test
  void register_Valid_ReturnsAuthenticatedUser() {
    NewUser nu = new NewUser();
    nu.setHonorific("Mr");
    nu.setFirstName("A");
    nu.setLastName("B");
    nu.setEmail("a@b.com");
    nu.setPassword("pwd");
    nu.setPhoneNumber("0123");
    nu.setRole("CLIENT");
    nu.setCompany("C");
    nu.setAddress(new NewAddress("S", "1", "A", 1000, "City", new NewCountry("X")));

    AuthenticatedUser au = new AuthenticatedUser();
    au.setEmail("a@b.com");
    when(userService.register(
            eq("Mr"), eq("A"), eq("B"), eq("a@b.com"),
            eq("pwd"), eq("0123"), eq("CLIENT"), eq("C"),
            eq("S"), eq("1"), eq("A"), eq(1000),
            eq("City"), eq("X")
    )).thenReturn(au);

    AuthenticatedUser result = authController.register(nu);

    assertEquals("a@b.com", result.getEmail());
  }

  @Test
  void register_ServiceThrowsResponseStatusException_RethrowsSameException() {
    // Setup valid NewUser object
    NewUser nu = new NewUser();
    nu.setHonorific("Mr");
    nu.setFirstName("C");
    nu.setLastName("D");
    nu.setEmail("c@d.com");
    nu.setPassword("pwd");
    nu.setPhoneNumber("0123");
    nu.setRole("CLIENT");
    nu.setCompany("C");
    nu.setAddress(new NewAddress("S", "1", "A", 1000, "City", new NewCountry("X")));

    // Have the service throw a ResponseStatusException (like a 403 FORBIDDEN)
    ResponseStatusException originalException = new ResponseStatusException(
            HttpStatus.FORBIDDEN, "Specific error from service");

    when(userService.register(
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyInt(),
            anyString(), anyString()
    )).thenThrow(originalException);

    // The controller should re-throw the exact same exception
    ResponseStatusException thrownException = assertThrows(ResponseStatusException.class,
            () -> authController.register(nu));

    // Verify it's the same exception and not wrapped
    assertSame(originalException, thrownException);
    assertEquals(HttpStatus.FORBIDDEN, thrownException.getStatusCode());
    assertEquals("Specific error from service", thrownException.getReason());
  }

  @Test
  void register_ServiceThrowsGenericException_ThrowsInternalServerError() {
    // Setup valid NewUser object
    NewUser nu = new NewUser();
    nu.setHonorific("Mrs");
    nu.setFirstName("E");
    nu.setLastName("F");
    nu.setEmail("e@f.com");
    nu.setPassword("pwd");
    nu.setPhoneNumber("0123");
    nu.setRole("CLIENT");
    nu.setCompany("C");
    nu.setAddress(new NewAddress("S", "1", "A", 1000, "City", new NewCountry("X")));

    // Mock a generic exception from the service
    RuntimeException originalException = new RuntimeException("Something went wrong in the service");

    when(userService.register(
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyString(),
            anyString(), anyString(), anyString(), anyInt(),
            anyString(), anyString()
    )).thenThrow(originalException);

    // The controller should wrap it in a 500 INTERNAL_SERVER_ERROR
    ResponseStatusException thrownException = assertThrows(ResponseStatusException.class,
            () -> authController.register(nu));

    // Verify it's a 500 with the right message and cause
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrownException.getStatusCode());
    assertEquals("An error occurred during registration", thrownException.getReason());
    assertEquals(originalException, thrownException.getCause());
  }

  @Test
  void updatePassword_InvalidPayload_ThrowsBadRequest() {
    PasswordUpdate pu = new PasswordUpdate(); // missing fields
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> authController.updatePassword(pu));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
  }

  @Test
  void updatePassword_MismatchedConfirm_ThrowsBadRequest() {
    PasswordUpdate pu = new PasswordUpdate("e@x.com", "old", "new1", "new2");
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> authController.updatePassword(pu));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("New password and confirmation do not match", exception.getReason());
  }

  @Test
  void updatePassword_Valid_ReturnsOkMessage() {
    PasswordUpdate pu = new PasswordUpdate("e@x.com", "old", "new", "new");
    try {
      doNothing().when(userService).updatePassword("e@x.com", "old", "new");
    } catch (Exception e) {
      e.printStackTrace();
    }

    ResponseEntity<String> resp = authController.updatePassword(pu);

    assertEquals(200, resp.getStatusCodeValue());
    assertTrue(resp.getBody().contains("Password updated successfully"));

    try {
      verify(userService).updatePassword("e@x.com", "old", "new");
    } catch (Exception e) {
      fail("Verification should not throw an exception");
    }
  }

  @Test
  void updatePassword_ServiceThrowsException_ThrowsInternalServerError() {
    // Setup valid password update request
    PasswordUpdate pu = new PasswordUpdate("user@example.com", "oldPass", "newPass", "newPass");

    // Mock the service to throw an exception
    Exception serviceException = new RuntimeException("Database connection error");
    try {
      doThrow(serviceException).when(userService).updatePassword(
              eq("user@example.com"), eq("oldPass"), eq("newPass"));
    } catch (Exception e) {
      fail("Mock setup should not throw an exception");
    }

    // Execute and verify the correct exception is thrown
    ResponseStatusException thrownException = assertThrows(ResponseStatusException.class,
            () -> authController.updatePassword(pu));

    // Verify it's wrapped in a 500 with the right message and cause
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrownException.getStatusCode());
    assertEquals("Error updating password", thrownException.getReason());
    assertEquals(serviceException, thrownException.getCause());

    // Verify service method was called
    try {
      verify(userService).updatePassword(
              eq("user@example.com"), eq("oldPass"), eq("newPass"));
    } catch (Exception e) {
      fail("Verification should not throw an exception");
    }
  }

  @Test
  void account_ReturnsUser() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User u = new User();
    u.setEmail("u@x.com");
    when(userService.getUser(req)).thenReturn(u);

    User result = authController.account(req);

    assertEquals("u@x.com", result.getEmail());
  }

  @Test
  void me_ReturnsNewToken() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User u = new User();
    u.setEmail("u@x.com");
    AuthenticatedUser tok = new AuthenticatedUser();
    tok.setEmail("u@x.com");
    when(userService.getUser(req)).thenReturn(u);
    when(userService.createJwtToken("u@x.com")).thenReturn(tok);

    AuthenticatedUser result = authController.me(req);

    assertEquals("u@x.com", result.getEmail());
  }
}
