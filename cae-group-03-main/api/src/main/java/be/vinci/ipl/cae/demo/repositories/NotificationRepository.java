package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for Notification entities.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Retrieve all notifications for a given producer (user).
   *
   * @param producerId the producer’s user ID
   * @return the list of notifications
   */
  List<Notification> findByProducerIdUser(Long producerId);

  /**
   * Mark a notification as read.
   *
   * @param idNotification the notification ID
   * @return the number of rows updated (should be 0 or 1)
   */
  @Modifying
  @Transactional
  @Query("UPDATE Notification n SET n.read = true WHERE n.idNotification = :id")
  int updateReadArgument(@Param("id") Long idNotification);
}
