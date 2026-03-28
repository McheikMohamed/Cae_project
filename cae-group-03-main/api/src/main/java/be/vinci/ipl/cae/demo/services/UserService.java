package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Country;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.CountryRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * User service.
 */
@Service
public class UserService {

  @Value("${SECRET_JWT}")
  private String jwtSecret;

  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private Algorithm algorithm;


  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;
  private final CountryRepository countryRepository;

  /**
   * Constructor.
   */
  @PostConstruct
  public void init() {
    if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
      throw new IllegalStateException("JWT secret is missing!");
    }
    algorithm = Algorithm.HMAC256(jwtSecret);
  }


  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository,
      AddressRepository addressRepository, CountryRepository countryRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
    this.countryRepository = countryRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the email to included in the claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new IllegalArgumentException("User not found for email: " + email);
    }
    String token = JWT.create().withIssuer("auth0")
        .withClaim("email", email)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
        .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setFirstName(user.getFirstName());
    authenticatedUser.setRole(user.getRole());
    authenticatedUser.setToken(token);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    System.out.println(readOneFromEmail("Ligne : " + token));
    try {
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      System.out.println(readOneFromEmail("Ligne : " + token));
      return null;
    }
  }

  /**
   * Login a user.
   *
   * @param email    the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }

    if (!passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    System.out.println("newToken : " + createJwtToken(email));

    return createJwtToken(email);
  }

  /**
   * Register a new user.
   *
   * @param honorific   the honorific
   * @param firstName   the first name
   * @param lastName    the last name
   * @param email       the email
   * @param password    the password
   * @param phoneNumber the phone number
   * @param role        the role
   * @param company     the company
   * @param street      the street
   * @param number      the number
   * @param box         the box
   * @param postalCode  the postal code
   * @param city        the city
   * @param country     the country
   * @return the authenticated user if the registration is successful, null otherwise
   */
  public AuthenticatedUser register(String honorific, String firstName, String lastName,
      String email, String password, String phoneNumber, String role, String company, String street,
      String number, String box, int postalCode, String city, String country) {

    User user = userRepository.findByEmail(email);
    if (user != null) {
      return null;
    }
    Country countryRepo = countryRepository.findByName(country);
    if (countryRepo == null) {
      countryRepo = new Country();
      countryRepo.setName(country);
      countryRepository.save(countryRepo);
    }

    Address addressRepo =
        addressRepository.findByStreetAndNumberAndBoxAndPostalCodeAndCityAndCountry(
        street, number, box, postalCode, city, countryRepo);
    if (addressRepo == null) {
      addressRepo = new Address();
      addressRepo.setStreet(street);
      addressRepo.setNumber(number);
      addressRepo.setBox(box);
      addressRepo.setPostalCode(postalCode);
      addressRepo.setCity(city);
      addressRepo.setCountry(countryRepo);
      addressRepository.save(addressRepo);
    }

    User userRepo = new User();
    userRepo.setHonorific(honorific);
    userRepo.setFirstName(firstName);
    userRepo.setLastName(lastName);
    userRepo.setEmail(email);

    String hashedPassword = passwordEncoder.encode(password);
    userRepo.setPassword(hashedPassword);
    userRepo.setPhoneNumber(phoneNumber);
    userRepo.setRole(role);
    userRepo.setRegisterDate(LocalDate.now());
    userRepo.setAddress(addressRepo);
    userRepo.setCompany(company);

    userRepository.save(userRepo);

    User createdUser = userRepository.findByEmail(email);
    if (createdUser == null) {
      return null;
    }

    return createJwtToken(email);
  }

  /**
   * Read a user from its email.
   *
   * @param email the email
   * @return the user if it exists, null otherwise
   */
  public User readOneFromEmail(String email) {
    return userRepository.findByEmail(email);
  }

  /**
   * Update the password of a user.
   *
   * @param email       the email
   * @param oldPassword the old password
   * @param newPassword the new password
   * @throws Exception if any condition fails.
   */
  @Transactional
  public void updatePassword(String email, String oldPassword, String newPassword)
      throws Exception {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new Exception("User does not exist");
    }

    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
      throw new Exception("Old password is incorrect");
    }

    if (newPassword == null || newPassword.isBlank()) {
      throw new Exception("New password is invalid");
    }

    if (passwordEncoder.matches(newPassword, user.getPassword())) {
      throw new Exception("New password is the same as the old password");
    }

    String hashedPassword = passwordEncoder.encode(newPassword);
    userRepository.updatePassword(user.getIdUser(), hashedPassword);

  }

  /**
   * Récupère l'utilisateur correspondant au token JWT présent dans l'en-tête de la requête.
   * Cette méthode vérifie que le token JWT est présent et valide. Ensuite, elle extrait l'adresse
   * email depuis le token et recherche l'utilisateur correspondant dans la base de données.
   *
   * @param request La requête HTTP contenant le token JWT dans l'en-tête "Authorization".
   * @return L'utilisateur authentifié correspondant au token.
   * @throws ResponseStatusException 401 si le token est manquant ou invalide.
   * @throws ResponseStatusException 404 si aucun utilisateur trouvé pour l'email extrait du token.
   */
  public User getUser(HttpServletRequest request) {
    String token = request.getHeader("Authorization");
    if (token == null || token.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "token missing or invalid");
    }

    String email = verifyJwtToken(token);
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "token invalid");
    }

    User user = readOneFromEmail(email);
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found");
    }

    return user;
  }
}
