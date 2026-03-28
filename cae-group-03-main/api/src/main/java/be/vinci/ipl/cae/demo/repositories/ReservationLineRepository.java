package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * ReservationLine repository.
 */
@Repository
public interface ReservationLineRepository extends CrudRepository<ReservationLine, Long> {

  /**
   * Find all reservation lines by reservation ID.
   *
   * @param reservationId the reservation ID
   * @return the reservation lines
   */
  Iterable<ReservationLine> findAllByReservation(Reservation reservationId);
  
  /**
   * Delete all by reservation.
   *
   * @param reservation the reservation
   */
  void deleteAllByReservation(Reservation reservation);

}
