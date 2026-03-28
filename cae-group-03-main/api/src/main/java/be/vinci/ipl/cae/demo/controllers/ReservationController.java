package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.CreateReservationRequest;
import be.vinci.ipl.cae.demo.models.dtos.ReservationUserRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateReservationStatusRequest;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.ReservationService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Reservation controller.
 */
@RestController
@RequestMapping("/reservations")
public class ReservationController {

  private final ReservationService reservationService;
  private final UserService userService;

  /**
   * Constructor for ReservationController.
   *
   * @param reservationService the injected ReservationService.
   */
  public ReservationController(ReservationService reservationService, UserService userService) {
    this.reservationService = reservationService;
    this.userService = userService;
  }

  /**
   * Check if the reservationLine is valid.
   *
   * @param reservationLine the reservation line to check.
   * @return true if the reservationLine is invalid, false otherwise.
   */
  private boolean isInvalidReservationLine(ReservationLine reservationLine) {
    return reservationLine == null || reservationLine.getBatch() == null
        || reservationLine.getQuantity() < 0 || reservationLine.getReservation() == null;
  }

  /**
   * Create a reservation line.
   *
   * @param reservationLine the reservation line to create.
   * @throws IllegalArgumentException if the reservation line is invalid.
   */
  @PostMapping("/createReservationLine")
  public void createReservationLine(ReservationLine reservationLine) {
    if (isInvalidReservationLine(reservationLine)) {
      throw new IllegalArgumentException("Invalid reservation line");
    }
    reservationService.createReservationLine(reservationLine.getReservation().getIdReservation(),
        reservationLine.getBatch().getIdBatch(), reservationLine.getQuantity());
  }

  /**
   * Create a reservation.
   *
   * @param requestBody the reservation to create.
   * @throws IllegalArgumentException if the reservation is invalid.
   * @throws IllegalArgumentException if the reservation status is invalid.
   * @throws IllegalArgumentException if the user is not found.
   */
  @PostMapping("/createReservation")
  public void createReservation(@RequestBody CreateReservationRequest requestBody,
                                HttpServletRequest request) {
    System.out.println("date reçue du front : " + requestBody.getDate());
    User user = userService.getUser(request);
    System.out.println(requestBody.getCart());
    reservationService.createReservation(requestBody.getCart(), user, requestBody.getDate());
  }

  /**
   * Get all reservations lines.
   *
   * @param reservationId the reservation ID.
   * @return the reservations line.
   */
  @GetMapping("/getReservationLinesById")
  public Iterable<ReservationLine> getReservationLinesById(@RequestParam Long reservationId) {
    return reservationService.getReservationLinesById(reservationId);
  }

  /**
   * Get all reservations.
   *
   * @return the reservations.
   */
  @GetMapping("/getReservations")
  public Iterable<Reservation> getReservations() {
    return reservationService.getAllReservations();
  }

  /**
   * Get all reservations.
   *
   * @return the reservations.
   */
  @GetMapping("/getReservationsWithUserName")
  public Iterable<ReservationUserRequest> getReservationsUser() {
    return reservationService.getAllReservationUserRequests();
  }

  /**
   * Get all reservations for a user.
   *
   * @return the reservations.
   */
  @GetMapping("/getReservationsUser")
  public Iterable<Reservation> getReservationsForUser(HttpServletRequest request) {
    User user = userService.getUser(request);
    return reservationService.getAllReservationByUser(user);
  }

  /**
   * Update a reservation status.
   *
   * @param response the reservation status to update.
   * @throws IllegalArgumentException if the reservation is invalid.
   * @throws IllegalArgumentException if the reservation status is invalid.
   */
  @PatchMapping("/updateReservationStatus")
  public void updateReservationStatus(@RequestBody UpdateReservationStatusRequest response) {
    reservationService.updateReservationStatus(response.getReservationId(), response.getStatus());
  }

  /**
   * Récupère l'historique des réservations fermées de l'utilisateur authentifié.
   * Cette méthode vérifie la validité du token JWT présent dans l'en-tête Authorization,
   * puis identifie l'utilisateur correspondant à ce token. Si l'utilisateur est trouvé,
   * elle retourne la liste de ses réservations fermées.
   *
   * @param request La requête HTTP contenant l'en-tête Authorization avec le token JWT.
   * @return Une liste iterable des réservations fermées liées à l'utilisateur authentifié.
   * @throws ResponseStatusException 401 si le token est manquant ou invalide.
   * @throws ResponseStatusException 404 si l'utilisateur n'est pas trouvé.
   */
  @GetMapping("/userHistorics")
  public Iterable<Reservation> getUserHistorics(HttpServletRequest request) {
    User user = userService.getUser(request);

    return reservationService.getAllClosedReservationsByUser(user);
  }


  /**
   * Delete reservation.
   *
   * @param reservationId the id of the reservation to delete.
   * @throws IllegalArgumentException if the reservation is invalid.
   * @throws IllegalArgumentException if the reservation status is invalid.
   */
  @PatchMapping("/delete")
  public void deleteReservation(@RequestBody Long reservationId) {
    if (reservationId == null) {
      throw new IllegalArgumentException("Invalid reservation line");
    }
    reservationService.delete(reservationId);
  }
}

