package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Reservation repository.
 */

@Repository
public interface ReservationRepository extends CrudRepository<Reservation, Long> {

  /**
   * Update the status of a reservation.
   *
   * @param id     the reservation ID
   * @param status the new status
   */
  @Modifying
  @Query("UPDATE Reservation r SET r.status = :status WHERE r.idReservation = :id")
  void updateStatus(@Param("id") Long id, @Param("status") String status);

  /**
   * Récupère toutes les réservations ayant un statut donné.
   *
   * @param status Le statut des réservations à rechercher (Pending)
   * @return Une liste iterable de réservations correspondant au statut spécifié.
   */
  Iterable<Reservation> findByStatus(String status);


  /**
   * Récupère les réservations fermées (status = 'closed') pour un utilisateur donné.
   * Cette méthode exécute une requête personnalisée qui ne sélectionne que les champs :
   * idReservation, recoveryDate et status.
   * Attention : en sélectionnant uniquement certains champs, cela peut empêcher
   * l’hydratation complète des objets Reservation (sauf si un constructeur spécifique est utilisé).
   *
   * @param user L'utilisateur dont on souhaite obtenir les réservations fermées.
   * @return Un iterable d'objets partiels de Reservation
   */
  @Query("SELECT r.idReservation, r.recoveryDate, r.status "
      + "FROM Reservation r WHERE r.user = :user AND r.status = 'CLOSED'")
  Iterable<Reservation> findAllClosedReservationsByUser(@Param("user") User user);

  /**
   * Retrieves all reservations made by the specified user.
   * This method queries the database for all {@link Reservation} entities
   * that are associated with the given {@link User}.
   *
   * @param user the user whose reservations are to be fetched
   * @return an {@link Iterable} containing all reservations associated with the user
   */
  Iterable<Reservation> findAllByUser(User user);

}
