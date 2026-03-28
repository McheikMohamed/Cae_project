package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.CreateReservationRequest;
import be.vinci.ipl.cae.demo.models.dtos.ReservationUserRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateReservationStatusRequest;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.ReservationService;
import be.vinci.ipl.cae.demo.services.UserService;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

  @Mock
  private ReservationService reservationService;

  @Mock
  private UserService userService;

  @InjectMocks
  private ReservationController reservationController;

  @Test
  void createReservationLine_Valid_CallsService() {
    ReservationLine rl = new ReservationLine();
    rl.setReservation(new be.vinci.ipl.cae.demo.models.entities.Reservation()); 
    rl.getReservation().setIdReservation(10L);
    rl.setBatch(new be.vinci.ipl.cae.demo.models.entities.Batch());
    rl.getBatch().setIdBatch(5L);
    rl.setQuantity(3);

    reservationController.createReservationLine(rl);

    verify(reservationService)
      .createReservationLine(10L, 5L, 3);
  }

  @Test
  void createReservationLine_Invalid_Throws() {
    ReservationLine rl = new ReservationLine(); // missing batch or reservation
    assertThrows(IllegalArgumentException.class,
      () -> reservationController.createReservationLine(rl));
  }

  @Test
  void createReservation_Valid_CallsService() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User(); user.setIdUser(2L);
    when(userService.getUser(req)).thenReturn(user);

    CreateReservationRequest reqBody = new CreateReservationRequest();
    reqBody.setCart(List.of(new be.vinci.ipl.cae.demo.models.dtos.NewBatch(5,null, 1, 0, null, null)));
    Date date = new Date();
    reqBody.setDate(date);

    reservationController.createReservation(reqBody, req);

    verify(reservationService)
      .createReservation(reqBody.getCart(), user, date);
  }

  @Test
  void getReservationLinesById_ReturnsIterable() {
    List<ReservationLine> lines = List.of(new ReservationLine(), new ReservationLine());
    when(reservationService.getReservationLinesById(7L)).thenReturn(lines);

    Iterable<ReservationLine> result = reservationController.getReservationLinesById(7L);

    assertSame(lines, result);
    verify(reservationService).getReservationLinesById(7L);
  }

  @Test
  void getReservations_ReturnsAll() {
    List<be.vinci.ipl.cae.demo.models.entities.Reservation> rs =
      List.of(new be.vinci.ipl.cae.demo.models.entities.Reservation());
    when(reservationService.getAllReservations()).thenReturn(rs);

    Iterable<be.vinci.ipl.cae.demo.models.entities.Reservation> result =
      reservationController.getReservations();

    assertSame(rs, result);
    verify(reservationService).getAllReservations();
  }

  @Test
  void getReservationsForUser_CallsService() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User(); user.setIdUser(3L);
    when(userService.getUser(req)).thenReturn(user);
    List<be.vinci.ipl.cae.demo.models.entities.Reservation> rs = List.of();
    when(reservationService.getAllReservationByUser(user)).thenReturn(rs);

    Iterable<be.vinci.ipl.cae.demo.models.entities.Reservation> result =
      reservationController.getReservationsForUser(req);

    assertSame(rs, result);
    verify(userService).getUser(req);
    verify(reservationService).getAllReservationByUser(user);
  }

  @Test
  void getUserHistorics_CallsService() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User(); user.setIdUser(4L);
    when(userService.getUser(req)).thenReturn(user);
    List<be.vinci.ipl.cae.demo.models.entities.Reservation> rs = List.of();
    when(reservationService.getAllClosedReservationsByUser(user)).thenReturn(rs);

    Iterable<be.vinci.ipl.cae.demo.models.entities.Reservation> result =
      reservationController.getUserHistorics(req);

    assertSame(rs, result);
    verify(userService).getUser(req);
    verify(reservationService).getAllClosedReservationsByUser(user);
  }

  @Test
  void deleteReservation_Valid_CallsService() {
    Long id = 12L;
    reservationController.deleteReservation(id);
    verify(reservationService).delete(id);
  }

  @Test
  void deleteReservation_Null_Throws() {
    assertThrows(IllegalArgumentException.class,
      () -> reservationController.deleteReservation(null));
  }

  @Test
  void updateReservationStatus_Valid_CallsService() {
    UpdateReservationStatusRequest req = 
      new UpdateReservationStatusRequest(15L, "CANCELLED");
    reservationController.updateReservationStatus(req);
    verify(reservationService).updateReservationStatus(15L, "CANCELLED");
  }

  @Test
  void getReservationsUser_CallsServiceAndReturnsResult() {
    ReservationController reservationController = new ReservationController(reservationService, userService);

    // Mock de la réponse attendue
    List<ReservationUserRequest> expectedReservations = List.of(new ReservationUserRequest());

    // Simulation de l’appel service
    when(reservationService.getAllReservationUserRequests()).thenReturn(expectedReservations);

    // Appel de la méthode contrôleur
    Iterable<ReservationUserRequest> result = reservationController.getReservationsUser();

    // Vérification du résultat et des appels
    assertSame(expectedReservations, result);
    verify(reservationService).getAllReservationUserRequests();
  }
}
