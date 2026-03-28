package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.ReservationUserRequest;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reservation service.
 */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final ReservationLineRepository reservationLineRepository;
  private final BatchRepository batchRepository;
  private final CartService cartService;

  /**
   * Constructor.
   *
   * @param reservationRepository the reservation repository
   * @param cartService        the user repository
   * @param batchRepository       the batch repository
   */
  public ReservationService(ReservationRepository reservationRepository,
                            BatchRepository batchRepository,
                            ReservationLineRepository reservationLineRepository,
                            CartService cartService) {
    this.reservationRepository = reservationRepository;
    this.batchRepository = batchRepository;
    this.reservationLineRepository = reservationLineRepository;
    this.cartService = cartService;
  }


  /**
   * Create a reservation.
   *
   * @param batches the list of batches to reserve
   */
  @Transactional
  public void createReservation(List<NewBatch> batches, User user, Date date) {
    // First validate all batches exist before doing any operations
    for (NewBatch batch : batches) {

      batchRepository.findById((long) batch.getIdBatch())
              .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }

    // Only after validating all batches, create and save the reservation
    Reservation reservation = new Reservation();
    reservation.setStatus("Pending");
    reservation.setRecoveryDate(date); // 1 day later
    reservation.setUser(user);
    reservationRepository.save(reservation);

    // Process all batches
    for (NewBatch batch : batches) {
      Batch b = batchRepository.findById((long) batch.getIdBatch()).get(); // Safe now
      ReservationLine reservationLine = new ReservationLine();
      reservationLine.setBatch(b);
      reservationLine.setReservation(reservation);
      reservationLine.setQuantity(batch.getQuantity());
      batchRepository.updateAddQuantityReserved(b.getIdBatch(), reservationLine.getQuantity());
      reservationLineRepository.save(reservationLine);
    }

    // Delete cart at the end after all operations succeeded
    cartService.deleteCartByUser(user);
  }

  /**
   * Supprime une réservation ainsi que toutes les lignes associées.
   *
   * @param reservationId l'identifiant unique de la réservation à supprimer
   * @throws IllegalArgumentException si aucune réservation n'est trouvée avec l'identifiant donné
   */
  @Transactional
  public void delete(Long reservationId) {
    Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
    reservationLineRepository.deleteAllByReservation(reservation);
    reservationRepository.delete(reservation);
  }

  /**
   * Create a reservation Line.
   *
   * @param reservationId the reservation ID
   * @param batchId       the batch ID
   * @param quantity      the quantity
   */
  public void createReservationLine(Long reservationId, Long batchId, int quantity) {
    ReservationLine reservationLine = new ReservationLine();
    Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
    Batch batch = batchRepository.findById(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    reservationLine.setReservation(reservation);
    reservationLine.setBatch(batch);
    reservationLine.setQuantity(quantity);
    reservationLineRepository.save(reservationLine);
  }

  /**
   * Get all reservations lines by reservation ID.
   *
   * @param reservationId the reservation ID
   * @return all reservations lines for this reservation
   */
  public Iterable<ReservationLine> getReservationLinesById(Long reservationId) {
    Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));



    return reservationLineRepository.findAllByReservation(reservation);
  }

  /**
   * Get all reservations.
   *
   * @return all reservations
   */
  public Iterable<Reservation> getAllReservations() {
    return reservationRepository.findAll();
  }

  /**
   * Get all reservations with lastname of user.
   *
   * @return all reservations
   */
  public Iterable<ReservationUserRequest> getAllReservationUserRequests() {
    Iterable<Reservation> reservations = reservationRepository.findByStatus("Pending");
    List<ReservationUserRequest> reservationUserRequestsList = new ArrayList<>();

    for (Reservation reservation : reservations) {
      User user = reservation.getUser();
      reservationUserRequestsList.add(new ReservationUserRequest(
              reservation,
              user.getLastName(),
              user.getHonorific()
      ));
    }

    return reservationUserRequestsList;
  }



  /**
   * Update status of a reservation.
   *
   * @param reservationId the reservation ID
   * @param status        the new status
   * @return the updated reservation
   */
  @Transactional
  public Reservation updateReservationStatus(Long reservationId, String status) {
    Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
    reservationLineRepository.findAllByReservation(reservation).forEach(reservationLine -> {
      Batch batch = reservationLine.getBatch();
      batchRepository.updateSubQuantityReserved(batch.getIdBatch(),
              reservationLine.getQuantity());
    });
    reservationRepository.updateStatus(reservationId, status);

    return reservation;
  }
  /**
   * Récupère toutes les réservations (fermées ou non) associées à un utilisateur donné.
   *
   * @param user L'utilisateur pour lequel récupérer les réservations.
   * @return Une liste iterable de réservations liées à l'utilisateur.
   */

  public Iterable<Reservation> getAllClosedReservationsByUser(User user) {
    return reservationRepository.findAllClosedReservationsByUser(user);
  }

  /**
   * Retrieves all reservations associated with a given user.
   *
   * @param user the user for whom to retrieve reservations
   * @return an iterable list of {@link Reservation} objects belonging to the user
   */
  public Iterable<Reservation> getAllReservationByUser(User user) {
    return reservationRepository.findAllByUser(user);
  }

}