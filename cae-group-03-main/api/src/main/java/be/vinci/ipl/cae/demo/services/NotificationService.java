package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for managing notifications.
 */
@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final BatchRepository batchRepository;

  /**
   * Constructor for NotificationService.
   *
   * @param notificationRepository the notification repository
   * @param batchRepository        the batch repository
   */
  public NotificationService(NotificationRepository notificationRepository,
                             BatchRepository batchRepository) {
    this.notificationRepository = notificationRepository;
    this.batchRepository = batchRepository;
  }

  /**
   * Creates a new notification.
   *
   * @param notification the notification to create
   * @return the created notification
   */
  public Notification createNotification(NewNotification notification) {
    Notification newNotification = new Notification();
    newNotification.setMessage(notification.getMessage());
    newNotification.setRead(false);
    newNotification.setDate(LocalDate.now());
    newNotification.setReasonOfReject(notification.getReasonOfReject());

    if (notification.getBatchId() != null && notification.getBatchId() > 0) {
      Batch batch = batchRepository.findByBatchId(notification.getBatchId());
      newNotification.setBatch(batch);
      newNotification.setProducer(batch.getProducer());
    }

    return notificationRepository.save(newNotification);
  }

  /**
   * Get notifications for a given user principal.
   *
   * @param principal the authenticated principal
   * @return a list of notifications for the user
   */
  public List<Notification> getNotificationsByUserPrincipal(Object principal) {
    if (!(principal instanceof User)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
              "Principal is not a valid user");
    }
    User user = (User) principal;
    return notificationRepository.findByProducerIdUser(user.getIdUser());
  }

  /**
   * Mark a notification as read.
   *
   * @param id the ID of the notification to mark as read
   * @return the updated notification
   */
  @Transactional
  public Notification markNotificationAsRead(Long id) {
    int updatedCount = notificationRepository.updateReadArgument(id);
    if (updatedCount == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
    }
    return notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Notification not found"));
  }
}
