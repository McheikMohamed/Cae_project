package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private BatchRepository batchRepository;

  @InjectMocks
  private NotificationService notificationService;

  @Test
  void createNotification_withBatchId_callsRepoAndReturnsNotification() {
    NewNotification dto = new NewNotification("Test msg", "Reason", 5L);
    Batch batch = new Batch();
    User producer = new User();
    producer.setIdUser(42L);
    batch.setIdBatch(5L);
    batch.setProducer(producer);

    when(batchRepository.findByBatchId(5L)).thenReturn(batch);
    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
    Notification saved = new Notification();
    saved.setIdNotification(100L);
    saved.setMessage(dto.getMessage());
    saved.setRead(false);
    saved.setReasonOfReject(dto.getReasonOfReject());
    saved.setDate(LocalDate.now());
    saved.setBatch(batch);
    saved.setProducer(producer);
    when(notificationRepository.save(any())).thenReturn(saved);

    Notification result = notificationService.createNotification(dto);

    verify(batchRepository).findByBatchId(5L);
    verify(notificationRepository).save(captor.capture());
    Notification toSave = captor.getValue();
    assertEquals("Test msg", toSave.getMessage());
    assertFalse(toSave.isRead());
    assertEquals("Reason", toSave.getReasonOfReject());
    assertEquals(batch, toSave.getBatch());
    assertEquals(producer, toSave.getProducer());
    assertEquals(100L, result.getIdNotification());
  }

  @Test
  void createNotification_withoutBatchId_savesWithoutBatch() {
    NewNotification dto = new NewNotification("No batch", null, 0L);
    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
    Notification saved = new Notification();
    saved.setIdNotification(200L);
    when(notificationRepository.save(any())).thenReturn(saved);

    Notification result = notificationService.createNotification(dto);

    verify(batchRepository, never()).findByBatchId(anyLong());
    verify(notificationRepository).save(captor.capture());
    Notification toSave = captor.getValue();
    assertNull(toSave.getBatch());
    assertNull(toSave.getProducer());
    assertEquals("No batch", toSave.getMessage());
    assertEquals(200L, result.getIdNotification());
  }

  @Test
  void getNotificationsByUserPrincipal_withValidUser_returnsList() {
    User user = new User();
    user.setIdUser(7L);
    Notification n1 = new Notification();
    Notification n2 = new Notification();
    when(notificationRepository.findByProducerIdUser(7L))
        .thenReturn(Arrays.asList(n1, n2));

    List<Notification> list = notificationService.getNotificationsByUserPrincipal(user);

    assertEquals(2, list.size());
    verify(notificationRepository).findByProducerIdUser(7L);
  }

  @Test
  void getNotificationsByUserPrincipal_withInvalidPrincipal_throws() {
    assertThrows(ResponseStatusException.class, () ->
        notificationService.getNotificationsByUserPrincipal("not a user"));
  }
}
