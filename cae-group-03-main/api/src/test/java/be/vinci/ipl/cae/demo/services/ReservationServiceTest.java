package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.ReservationUserRequest;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

  @Mock
  private ReservationRepository reservationRepository;

  @Mock
  private ReservationLineRepository reservationLineRepository;

  @Mock
  private BatchRepository batchRepository;

  @Mock
  private CartService cartService;

  @InjectMocks
  private ReservationService reservationService;

  @Test
  void createReservation_ShouldCreateReservationAndSaveLines() {
    // Arrange
    User user = new User();
    user.setIdUser(1L);
    user.setEmail("test@example.com");

    Date recoveryDate = new GregorianCalendar(2025, Calendar.APRIL, 18, 14, 30).getTime();

    NewBatch newBatch1 = new NewBatch();
    newBatch1.setIdBatch(1);
    newBatch1.setQuantity(5);

    NewBatch newBatch2 = new NewBatch();
    newBatch2.setIdBatch(2);
    newBatch2.setQuantity(10);

    Batch batch1 = new Batch();
    batch1.setIdBatch(1L);

    Batch batch2 = new Batch();
    batch2.setIdBatch(2L);

    Reservation savedReservation = new Reservation();
    savedReservation.setIdReservation(1L);

    when(batchRepository.findById(1L)).thenReturn(Optional.of(batch1));
    when(batchRepository.findById(2L)).thenReturn(Optional.of(batch2));
    when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

    // Act
    assertDoesNotThrow(
        () -> reservationService.createReservation(
            Arrays.asList(newBatch1, newBatch2), user, recoveryDate)
    );

    // Assert
    verify(reservationRepository, times(1)).save(any(Reservation.class));
    verify(cartService, times(1)).deleteCartByUser(user);
    verify(batchRepository, times(4)).findById(anyLong());
    verify(reservationLineRepository, times(2))
        .save(any(ReservationLine.class));
  }

  @Test
  void createReservation_ShouldThrowExceptionIfBatchNotFound() {
    // Arrange
    User user = new User();
    user.setIdUser(1L);
    user.setEmail("test@example.com");

    Date recoveryDate = new GregorianCalendar(2025, Calendar.APRIL, 18, 14, 30).getTime();

    NewBatch newBatch = new NewBatch();
    newBatch.setIdBatch(1);
    newBatch.setQuantity(5);

    List<NewBatch> batches = List.of(newBatch);

    // Simuler que le batch n'est pas trouvé
    when(batchRepository.findById(1L)).thenReturn(Optional.empty());

    // Act & Assert
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
      reservationService.createReservation(batches, user, recoveryDate);
    });

    assertEquals("Batch not found", exception.getMessage());

    // Vérifier que reservationRepository.save() n'est jamais appelé
    verify(reservationRepository, never()).save(any(Reservation.class));
    verify(reservationLineRepository, never()).save(any(ReservationLine.class));
    verify(cartService, never()).deleteCartByUser(any(User.class));
  }

  @Test
  void createReservationLine_ShouldSaveReservationLine() {
    // GIVEN
    Reservation reservation = new Reservation();
    Batch batch = new Batch();
    Long reservationId = 1L;
    Long batchId = 2L;
    int quantity = 5;

    when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
    when(batchRepository.findById(batchId)).thenReturn(Optional.of(batch));

    // WHEN
    reservationService.createReservationLine(reservationId, batchId, quantity);

    // THEN
    verify(reservationLineRepository, times(1))
        .save(any(ReservationLine.class));
  }

  @Test
  void createReservationLine_ShouldThrowException_WhenReservationNotFound() {
    // GIVEN
    when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

    // WHEN & THEN
    assertThrows(IllegalArgumentException.class,
        () -> reservationService.createReservationLine(1L, 2L, 5));
  }

  @Test
  void getAllReservationsLines_ShouldReturnLines() {
    // GIVEN
    Reservation reservation = new Reservation();
    reservation.setIdReservation(1L); // important pour le findById

    List<ReservationLine> lines = List.of(new ReservationLine(), new ReservationLine());

    when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
    when(reservationLineRepository.findAllByReservation(reservation)).thenReturn(lines);

    // WHEN
    Iterable<ReservationLine> result = reservationService.getReservationLinesById(1L);

    // THEN
    assertEquals(2, ((List<ReservationLine>) result).size());
    verify(reservationRepository, times(1)).findById(1L);
    verify(reservationLineRepository, times(1)).findAllByReservation(reservation);
  }


  @Test
  void getAllReservations_ShouldReturnReservations() {
    // GIVEN
    List<Reservation> reservations = List.of(new Reservation(), new Reservation());

    when(reservationRepository.findAll()).thenReturn(reservations);

    // WHEN
    Iterable<Reservation> result = reservationService.getAllReservations();

    // THEN
    assertEquals(2, ((List<Reservation>) result).size());
    verify(reservationRepository, times(1)).findAll();
  }

  @Test
  void updateReservationStatus_ShouldUpdateStatusAndAdjustBatchQuantities_WhenReservationExists() {
      // GIVEN
      Long reservationId = 1L;
      String newStatus = "Confirmed";

      Reservation reservation = new Reservation();
      reservation.setIdReservation(reservationId);

      Batch batch1 = new Batch();
      batch1.setIdBatch(1L);

      Batch batch2 = new Batch();
      batch2.setIdBatch(2L);

      ReservationLine line1 = new ReservationLine();
      line1.setBatch(batch1);
      line1.setQuantity(5);

      ReservationLine line2 = new ReservationLine();
      line2.setBatch(batch2);
      line2.setQuantity(10);

      List<ReservationLine> reservationLines = List.of(line1, line2);

      when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
      when(reservationLineRepository.findAllByReservation(reservation)).thenReturn(reservationLines);

      // WHEN
      Reservation updatedReservation = reservationService.updateReservationStatus(reservationId, newStatus);

      // THEN
      verify(batchRepository, times(1)).updateSubQuantityReserved(1L, 5);
      verify(batchRepository, times(1)).updateSubQuantityReserved(2L, 10);
      verify(reservationRepository, times(1)).updateStatus(reservationId, newStatus);
      assertNotNull(updatedReservation);
  }

@Test
void updateReservationStatus_ShouldThrowException_WhenReservationNotFound() {
    // GIVEN
    Long reservationId = 1L;
    String newStatus = "Confirmed";

    when(reservationRepository.findById(reservationId)).thenReturn(Optional.empty());

    // WHEN & THEN
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
        reservationService.updateReservationStatus(reservationId, newStatus);
    });

    assertEquals("Reservation not found", exception.getMessage());
    verify(batchRepository, never()).updateSubQuantityReserved(anyLong(), anyInt());
    verify(reservationRepository, never()).updateStatus(anyLong(), anyString());
}

  @Test
  void getAllReservationByUser_ShouldReturnReservations_WhenUserHasReservations() {

    User testUser = new User();
    testUser.setIdUser(1L);
    testUser.setEmail("client@example.com");
    // GIVEN
    List<Reservation> reservations = List.of(new Reservation(), new Reservation());

    when(reservationRepository.findAllByUser(testUser)).thenReturn(reservations);

    // WHEN
    Iterable<Reservation> result = reservationService.getAllReservationByUser(testUser);

    // THEN
    assertNotNull(result);
    assertEquals(2, ((List<Reservation>) result).size());
    verify(reservationRepository, times(1)).findAllByUser(testUser);
  }

  @Test
  void getAllReservationByUser_ShouldReturnEmptyList_WhenUserHasNoReservations() {
    User testUser = new User();
    testUser.setIdUser(1L);
    testUser.setEmail("client@example.com");
    // GIVEN
    when(reservationRepository.findAllByUser(testUser)).thenReturn(Collections.emptyList());

    // WHEN
    Iterable<Reservation> result = reservationService.getAllReservationByUser(testUser);

    // THEN
    assertNotNull(result);
    assertFalse(result.iterator().hasNext());
    verify(reservationRepository, times(1)).findAllByUser(testUser);
  }

  @Test
  void getAllReservationUserRequests_returnsCorrectData() {
    // Création des mocks
    User user1 = new User();
    user1.setLastName("Doe");
    user1.setHonorific("Mr");
    user1.setIdUser(1L);

    Reservation reservation1 = new Reservation();
    reservation1.setIdReservation(1L);
    reservation1.setUser(user1);

    when(reservationRepository.findByStatus("Pending")).thenReturn(List.of(reservation1));

    // Appel de la méthode testée
    Iterable<ReservationUserRequest> result = reservationService.getAllReservationUserRequests();

    // Vérification du contenu
    List<ReservationUserRequest> resultList = (List<ReservationUserRequest>) result;
    assertEquals(1, resultList.size());

    ReservationUserRequest req = resultList.get(0);
    assertEquals("Doe", req.getName());
    assertEquals("Mr", req.getHonorific());
    assertEquals(reservation1, req.getReservation());

    verify(reservationRepository).findByStatus("Pending");
  }

  @Test
  void getAllReservationUserRequests_withEmptyList_returnsEmpty() {
    when(reservationRepository.findByStatus("Pending")).thenReturn(List.of());

    Iterable<ReservationUserRequest> result = reservationService.getAllReservationUserRequests();

    assertNotNull(result);
    assertFalse(result.iterator().hasNext());
  }

  @Test
  void delete_ShouldDeleteReservationAndLines_WhenReservationExists() {
    // GIVEN
    Long reservationId = 1L;
    Reservation reservation = new Reservation();
    reservation.setIdReservation(reservationId);

    when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));

    // WHEN
    assertDoesNotThrow(() -> reservationService.delete(reservationId));

    // THEN
    verify(reservationLineRepository, times(1)).deleteAllByReservation(reservation);
    verify(reservationRepository, times(1)).delete(reservation);
  }

  @Test
  void delete_ShouldThrowException_WhenReservationDoesNotExist() {
    // GIVEN
    Long reservationId = 1L;

    when(reservationRepository.findById(reservationId)).thenReturn(Optional.empty());

    // WHEN & THEN
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
      reservationService.delete(reservationId);
    });

    assertEquals("Reservation not found", exception.getMessage());
    verify(reservationLineRepository, never()).deleteAllByReservation(any(Reservation.class));
    verify(reservationRepository, never()).delete(any(Reservation.class));
  }

  @Test
  void getAllClosedReservationsByUser_ShouldReturnClosedReservations_WhenUserHasClosedReservations() {
      // GIVEN
      User testUser = new User();
      testUser.setIdUser(1L);
      testUser.setEmail("client@example.com");

      List<Reservation> closedReservations = List.of(new Reservation(), new Reservation());

      when(reservationRepository.findAllClosedReservationsByUser(testUser)).thenReturn(closedReservations);

      // WHEN
      Iterable<Reservation> result = reservationService.getAllClosedReservationsByUser(testUser);

      // THEN
      assertNotNull(result);
      assertEquals(2, ((List<Reservation>) result).size());
      verify(reservationRepository, times(1)).findAllClosedReservationsByUser(testUser);
  }

  @Test
  void getAllClosedReservationsByUser_ShouldReturnEmptyList_WhenUserHasNoClosedReservations() {
      // GIVEN
      User testUser = new User();
      testUser.setIdUser(1L);
      testUser.setEmail("client@example.com");

      when(reservationRepository.findAllClosedReservationsByUser(testUser)).thenReturn(Collections.emptyList());

      // WHEN
      Iterable<Reservation> result = reservationService.getAllClosedReservationsByUser(testUser);

      // THEN
      assertNotNull(result);
      assertFalse(result.iterator().hasNext());
      verify(reservationRepository, times(1)).findAllClosedReservationsByUser(testUser);
  }
}
