package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.NotificationService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private NotificationController notificationController;

  @Test
  void createNotification_Valid_ReturnsCreated() {
    NewNotification dto = new NewNotification("msg", "reason", 1L);
    Notification saved = new Notification();
    saved.setIdNotification(10L);
    saved.setMessage("msg");
    when(notificationService.createNotification(dto)).thenReturn(saved);

    ResponseEntity<Notification> resp = notificationController.createNotification(dto);

    assertEquals(HttpStatus.CREATED, resp.getStatusCode());
    assertSame(saved, resp.getBody());
    verify(notificationService).createNotification(dto);
  }

  @Test
  void createNotification_ServiceError_ThrowsInternalServerError() {
    NewNotification dto = new NewNotification("msg", null, 0L);
    when(notificationService.createNotification(dto))
      .thenThrow(new RuntimeException("oops"));

    ResponseStatusException ex = assertThrows(
      ResponseStatusException.class,
      () -> notificationController.createNotification(dto)
    );
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
  }

  @Test
  void getUserNotifications_NullAuth_Returns401() {
    ResponseEntity<List<Notification>> resp =
      notificationController.getUserNotifications(null);
    assertEquals(401, resp.getStatusCodeValue());
    assertNull(resp.getBody());
  }

  @Test
  void getUserNotifications_NotAuthenticated_Returns401() {
    Authentication auth = mock(Authentication.class);
    when(auth.isAuthenticated()).thenReturn(false);

    ResponseEntity<List<Notification>> resp =
      notificationController.getUserNotifications(auth);
    assertEquals(401, resp.getStatusCodeValue());
    assertNull(resp.getBody());
  }

  @Test
  void getUserNotifications_ValidAuth_ReturnsNotifications() {
    Authentication auth = mock(Authentication.class);
    when(auth.isAuthenticated()).thenReturn(true);
    User user = new User();
    user.setIdUser(5L);
    when(auth.getPrincipal()).thenReturn(user);

    List<Notification> list = List.of(new Notification(), new Notification());
    when(notificationService.getNotificationsByUserPrincipal(user))
      .thenReturn(list);

    ResponseEntity<List<Notification>> resp =
      notificationController.getUserNotifications(auth);

    assertEquals(200, resp.getStatusCodeValue());
    assertSame(list, resp.getBody());
    verify(notificationService).getNotificationsByUserPrincipal(user);
  }

  @Test
  void getUserNotifications_InvalidPrincipal_PropagatesException() {
    Authentication auth = mock(Authentication.class);
    when(auth.isAuthenticated()).thenReturn(true);
    Object badPrincipal = new Object();
    when(auth.getPrincipal()).thenReturn(badPrincipal);
    when(notificationService.getNotificationsByUserPrincipal(badPrincipal))
      .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED));

    assertThrows(
      ResponseStatusException.class,
      () -> notificationController.getUserNotifications(auth)
    );
    verify(notificationService).getNotificationsByUserPrincipal(badPrincipal);
  }
}
