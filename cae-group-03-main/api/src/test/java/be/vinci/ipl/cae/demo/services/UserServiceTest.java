package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Country;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.CountryRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.lang.reflect.Field;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @Mock
  private CountryRepository countryRepository;

  @Mock
  private AddressRepository addressRepository;

  @Mock
  private HttpServletRequest request;

  @Spy
  @InjectMocks
  private UserService userService;

  private User user;
  private Address address;
  private Country country;
  private final String validToken = "valid.jwt.token";

  @BeforeEach
  void setUp() throws Exception {
    user = new User();
    address = new Address();
    country = new Country();
    address.setNumber("33");
    address.setStreet("avenue Louise");
    address.setPostalCode(1150);
    address.setCity("Bruxelles");
    country.setName("Belgique");
    address.setCountry(country);
    user.setAddress(address);
    user.setHonorific("Monsieur");
    user.setFirstName("John");
    user.setLastName("Doe");
    user.setEmail("john.doe@example.com");
    user.setPassword("Password");
    user.setPhoneNumber("1234567890");
    user.setRole("USER");
    user.setCompany("Example Company");

    // Set jwtSecret and call init() so the algorithm is initialized for testing.
    Field jwtSecretField = UserService.class.getDeclaredField("jwtSecret");
    jwtSecretField.setAccessible(true);
    jwtSecretField.set(userService, "test_secret");
    userService.init();
  }

  @Test
  void init_WithValidSecret_ShouldInitializeAlgorithm() {
    // Arrange
    ReflectionTestUtils.setField(userService, "jwtSecret", "valid_secret");

    // Act & Assert
    assertDoesNotThrow(() -> userService.init());
  }

  @Test
  void init_WithEmptySecret_ShouldThrowException() {
    // Arrange
    ReflectionTestUtils.setField(userService, "jwtSecret", "  ");

    // Act & Assert
    IllegalStateException exception = assertThrows(
        IllegalStateException.class,
        () -> userService.init()
    );
    assertEquals("JWT secret is missing!", exception.getMessage());
  }


  @Test
  void readOneFromUserEmailWithExistingUser() {
    when(userRepository.findByEmail("john.doe@example.com")).thenReturn(user); // Fixed email

    User foundUser = userService.readOneFromEmail("john.doe@example.com"); // Fixed email

    assertEquals(user, foundUser);
  }

  @Test
  void readOneFromUserEmailWithNonExistingUser() {
    when(userRepository.findByEmail("john.dish@example.com")).thenReturn(null); // Fixed email

    User foundUser = userService.readOneFromEmail("john.dish@example.com"); // Fixed email

    assertNull(foundUser);
  }

  @Test
  void register_ShouldCreateNewUser_WhenUserNotExists() {
    // Arrange
    String encodedPassword = "encodedPassword";

    when(userRepository.findByEmail(user.getEmail()))
        .thenReturn(null)  // pour vérifier si l'utilisateur existe déjà
        .thenReturn(user);
    when(countryRepository.findByName(country.getName())).thenReturn(null);
    when(addressRepository.findByStreetAndNumberAndBoxAndPostalCodeAndCityAndCountry(
            address.getStreet(), address.getNumber(), null,
            address.getPostalCode(), address.getCity(), country))
        .thenReturn(null);
    when(passwordEncoder.encode(user.getPassword())).thenReturn(encodedPassword);

    // Act
    AuthenticatedUser result = userService.register(
        user.getHonorific(), user.getFirstName(), user.getLastName(),
        user.getEmail(), user.getPassword(), user.getPhoneNumber(),
        user.getRole(), user.getCompany(),
        address.getStreet(), address.getNumber(), null,
        address.getPostalCode(), address.getCity(), country.getName());

    // Assert
    assertNotNull(result);
    assertNotNull(result.getToken());
  }


  @Test
  void testRegister_UserAlreadyExists() {
    when(userRepository.findByEmail("john.doe@example.com")).thenReturn(user); // Fixed email

    AuthenticatedUser result = userService.register("Mr.", "John", "Doe", "john.doe@example.com",
        // Fixed email
        "password123", "1234567890", "USER", "co and co", "Street", "1A", "1A", 1000, "City",
        "Country");

    assertNull(result);
  }

  @Test
  void register_ShouldReturnNull_WhenCreatedUserIsNullAfterSave() {
    // Arrange
    String email = "test@example.com";
    String password = "password123";
    String encodedPassword = "encodedPassword";

    // Simuler qu'aucun utilisateur n'existe au début
    when(userRepository.findByEmail(email)).thenReturn(null);

    // Simuler que le pays n'existe pas, donc un new Country sera créé et sauvé
    when(countryRepository.findByName("Country")).thenReturn(null);
    when(countryRepository.save(any(Country.class))).thenAnswer(inv -> inv.getArgument(0));

    // Stubbing de l'adresse avec matcher souple sur le Country
    when(addressRepository.findByStreetAndNumberAndBoxAndPostalCodeAndCityAndCountry(
        eq("Street"), eq("1A"), eq(null), eq(1000), eq("City"),
        argThat(c -> c != null && "Country".equals(c.getName()))
    )).thenReturn(null);

    when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

    // Encoder le mot de passe
    when(passwordEncoder.encode(password)).thenReturn(encodedPassword);

    // Simuler qu'après le save, findByEmail retourne encore null
    when(userRepository.findByEmail(email)).thenReturn(null);

    // Act
    AuthenticatedUser result = userService.register(
        "Mr.", "Test", "User", email, password, "0123456789",
        "USER", "SomeCompany",
        "Street", "1A", null, 1000, "City", "Country");

    // Assert
    assertNull(result);
  }



  @Test
  void loginWithExistingUser() {
    when(userRepository.findByEmail("john.doe@example.com")).thenReturn(user); // Fixed email
    when(passwordEncoder.matches("Password", "Password")).thenReturn(
        true); // Fixed password comparison

    AuthenticatedUser authenticatedUser1 = userService.login("john.doe@example.com",
        "Password"); // Fixed email

    assertNotNull(authenticatedUser1);
  }

  @Test
  void loginWithNonExistingUser() {
    when(userRepository.findByEmail("john.doe@example.com")).thenReturn(null); // Fixed email

    AuthenticatedUser result = userService.login("john.doe@example.com",
        "anyPassword"); // Fixed email

    assertNull(result);
  }

  @Test
  void loginWithInvalidPassword() {
    when(userRepository.findByEmail("john.doe@example.com")).thenReturn(user); // Fixed email
    when(passwordEncoder.matches("wrongPassword", "Password")).thenReturn(
        false); // Fixed password comparison

    AuthenticatedUser authenticatedUser1 = userService.login("john.doe@example.com",
        "wrongPassword"); // Fixed email

    assertNull(authenticatedUser1);
  }

  @Test
  void testCreateJwtToken() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(user);

    AuthenticatedUser result = userService.createJwtToken("test@example.com");

    assertNotNull(result);
    assertEquals("test@example.com", result.getEmail());
    assertNotNull(result.getToken());
  }

  @Test
  void testCreateJwtToken_ShouldThrowException_WhenUserNotFound() {
    // Arrange
    String email = "unknown@example.com";
    when(userRepository.findByEmail(email)).thenReturn(null);

    // Act & Assert
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> userService.createJwtToken(email)
    );

    assertEquals("User not found for email: " + email, exception.getMessage());
  }



  @Test
  void testVerifyJwtToken_ValidToken() {
    Algorithm testAlgorithm = Algorithm.HMAC256("secret_JWT_key_CAE03Group");
    ReflectionTestUtils.setField(userService, "algorithm", testAlgorithm);

    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("email", "test@example.com")
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + 100000))
        .sign(testAlgorithm);

    String email = userService.verifyJwtToken(token);
    assertEquals("test@example.com", email);
  }

  @Test
  void verifyJwtToken_ShouldReturnNull_WhenTokenIsInvalid() {
    String token = "invalid.token.string";

    String result = userService.verifyJwtToken(token);

    assertNull(result);
  }

  @Test
  void updatePassword_UserDoesNotExist_ThrowsException() {
    when(userRepository.findByEmail("noone@example.com")).thenReturn(null);
    assertThrows(Exception.class,
      () -> userService.updatePassword("noone@example.com", "oldPwd", "newPwd"));
  }

  @Test
  void updatePassword_OldPasswordIncorrect_ThrowsException() {
    User u = new User();
    u.setPassword("hashedOld");
    when(userRepository.findByEmail("user@example.com")).thenReturn(u);
    when(passwordEncoder.matches("wrongOld", "hashedOld")).thenReturn(false);
    assertThrows(Exception.class,
      () -> userService.updatePassword("user@example.com", "wrongOld", "newPwd"));
  }

  @Test
  void updatePassword_NewPasswordInvalid_ThrowsException() {
    User u = new User();
    u.setPassword("hashedOld");
    when(userRepository.findByEmail("user@example.com")).thenReturn(u);
    when(passwordEncoder.matches("oldPwd", "hashedOld")).thenReturn(true);
    assertThrows(Exception.class,
      () -> userService.updatePassword("user@example.com", "oldPwd", ""));
  }

  @Test
  void updatePassword_NewSameAsOld_ThrowsException() {
    User u = new User();
    u.setPassword("hashedOld");
    when(userRepository.findByEmail("user@example.com")).thenReturn(u);
    when(passwordEncoder.matches("oldPwd", "hashedOld")).thenReturn(true);
    when(passwordEncoder.matches("newPwd", "hashedOld")).thenReturn(true);
    assertThrows(Exception.class,
      () -> userService.updatePassword("user@example.com", "oldPwd", "newPwd"));
  }

  @Test
  void updatePassword_Valid_CallsRepository() throws Exception {
    User u = new User();
    u.setIdUser(7L);
    u.setPassword("hashedOld");
    when(userRepository.findByEmail("user@example.com")).thenReturn(u);
    when(passwordEncoder.matches("oldPwd", "hashedOld")).thenReturn(true);
    when(passwordEncoder.matches("newPwd", "hashedOld")).thenReturn(false);
    when(passwordEncoder.encode("newPwd")).thenReturn("hashedNew");
    doNothing().when(userRepository).updatePassword(7L, "hashedNew");

    userService.updatePassword("user@example.com", "oldPwd", "newPwd");

    verify(userRepository).updatePassword(7L, "hashedNew");
  }

  @Test
  void getUser_ShouldReturnUser_WhenTokenIsValidAndUserExists() {
    when(request.getHeader("Authorization")).thenReturn(validToken);
    // simulate token decoding (tu peux le stubber si c’est une méthode interne)
    doReturn(user.getEmail()).when(userService).verifyJwtToken(validToken);
    doReturn(user).when(userService).readOneFromEmail(user.getEmail());

    User result = userService.getUser(request);

    assertNotNull(result);
    assertEquals(user.getEmail(), result.getEmail());
  }

  @Test
  void getUser_ShouldThrowUnauthorized_WhenTokenMissing() {
    when(request.getHeader("Authorization")).thenReturn(null);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
      userService.getUser(request);
    });

    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    assertTrue(ex.getReason().contains("token missing or invalid"));
  }

  @Test
  void getUser_ShouldThrowUnauthorized_WhenTokenInvalid() {
    when(request.getHeader("Authorization")).thenReturn(validToken);
    doReturn(null).when(userService).verifyJwtToken(validToken);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
      userService.getUser(request);
    });

    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    assertTrue(ex.getReason().contains("token invalid"));
  }

  @Test
  void getUser_ShouldThrowNotFound_WhenUserDoesNotExist() {
    when(request.getHeader("Authorization")).thenReturn(validToken);
    doReturn(user.getEmail()).when(userService).verifyJwtToken(validToken);
    doReturn(null).when(userService).readOneFromEmail(user.getEmail());

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
      userService.getUser(request);
    });

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertTrue(ex.getReason().contains("user not found"));
  }
}
