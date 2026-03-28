package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.CartItem;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Cart;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

  @Mock
  private CartRepository cartRepository;

  @Mock
  private BatchService batchService;

  @Mock
  private BatchRepository batchRepository;

  @InjectMocks
  private CartService cartService;

  private User testUser;
  private Batch testBatch;
  private Cart testCart;

  @BeforeEach
  void setUp() {
    // Initialiser les objets de test
    testUser = new User();
    testUser.setIdUser(1L);
    testUser.setEmail("test@example.com");

    testBatch = new Batch();
    testBatch.setIdBatch(1L);
    testBatch.setQuantity(10);
    testBatch.setStatus("available");

    testCart = new Cart();
    testCart.setUser(testUser);
    testCart.setBatch(testBatch);
  }

  @Test
  void addToCart_ShouldAddBatchToCart() {
    // Arrange
    when(batchService.getBatchById(1L)).thenReturn(testBatch);
    when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

    // Act
    Cart result = cartService.addToCart(testUser, 1L, 3);

    // Assert
    assertNotNull(result);
    assertEquals(testUser, result.getUser());
    assertEquals(testBatch, result.getBatch());
    verify(batchService).getBatchById(1L);
    verify(cartRepository).save(any(Cart.class));
  }

  @Test
  void getBatchesByUser_ShouldReturnBatchesInCart() {
    // Arrange
    Cart cart1 = new Cart();
    cart1.setUser(testUser);
    cart1.setBatch(testBatch);
    cart1.setQuantity(3);

    Batch testBatch2 = new Batch();
    testBatch2.setIdBatch(2L);

    Cart cart2 = new Cart();
    cart2.setUser(testUser);
    cart2.setBatch(testBatch2);
    cart2.setQuantity(5);

    List<Cart> carts = Arrays.asList(cart1, cart2);

    when(cartRepository.findByUser(testUser)).thenReturn(carts);

    // Act
    List<CartItem> result = cartService.getBatchesByUser(testUser);

    // Assert
    assertEquals(2, result.size());

    // Vérifie que les éléments attendus sont dans le résultat
    assertTrue(result.stream().anyMatch(item ->
        item.getBatch().equals(testBatch) && item.getQuantity() == 3));

    assertTrue(result.stream().anyMatch(item ->
        item.getBatch().getIdBatch().equals(2L) && item.getQuantity() == 5));

    verify(cartRepository).findByUser(testUser);
  }

  @Test
  void getBatchesByUser_WithNullBatch_ShouldHandleGracefully() {
    // Arrange
    Cart cart = new Cart();
    cart.setUser(testUser);
    cart.setBatch(null); // batch null
    cart.setQuantity(2);

    when(cartRepository.findByUser(testUser)).thenReturn(List.of(cart));

    // Act
    List<CartItem> result = cartService.getBatchesByUser(testUser);

    // Assert
    assertTrue(result.isEmpty());
    verify(cartRepository).findByUser(testUser);
  }

  @Test
  void deleteCartByUserAndBatch_ShouldDeleteCart() {
    // Arrange
    when(cartRepository.findByUserAndBatchId(testUser, 1L)).thenReturn(Optional.of(testCart));
    doNothing().when(cartRepository).delete(testCart);

    // Act
    cartService.deleteCartByUserAndBatch(testUser, 1L);

    // Assert
    verify(cartRepository).findByUserAndBatchId(testUser, 1L);
    verify(cartRepository).delete(testCart);
  }

  @Test
  void deleteCartByUserAndBatch_WithNonExistentCart_ShouldThrowException() {
    // Arrange
    when(cartRepository.findByUserAndBatchId(testUser, 1L)).thenReturn(Optional.empty());

    // Act & Assert
    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
      cartService.deleteCartByUserAndBatch(testUser, 1L);
    });

    assertEquals("404 NOT_FOUND \"Cart not found\"", exception.getMessage());
    verify(cartRepository).findByUserAndBatchId(testUser, 1L);
    verify(cartRepository, never()).delete(any(Cart.class));
  }

  @Test
  void deleteCartByUser_ShouldDeleteAllUserCarts() {
    // Arrange
    doNothing().when(cartRepository).deleteAllByUser(testUser);

    // Act
    cartService.deleteCartByUser(testUser);

    // Assert
    verify(cartRepository).deleteAllByUser(testUser);
  }

  @Test
  void updateBatchQuantity_ShouldUpdateQuantity_WhenValidInput() {
    // Given
    int quantity = 5;

    when(cartRepository.findByUserAndBatchId(testUser, testBatch.getIdBatch()))
        .thenReturn(Optional.of(testCart));

    // When
    cartService.updateBatchQuantity(testUser, testBatch.getIdBatch(), quantity);

    // Then
    verify(cartRepository).findByUserAndBatchId(testUser, testBatch.getIdBatch());
    verify(cartRepository).updateBatchQuantity(testUser, testBatch.getIdBatch(), quantity);
  }

  @Test
  void updateBatchQuantity_ShouldThrowException_WhenQuantityIsZeroOrNegative() {
    // Given
    int invalidQuantity = 0;

    // When / Then
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
        cartService.updateBatchQuantity(testUser, testBatch.getIdBatch(), invalidQuantity)
    );

    assertEquals("La quantité doit être supérieure à 0.", exception.getMessage());
    verify(cartRepository, never()).findByUserAndBatchId(any(), anyLong());
  }

  @Test
  void updateBatchQuantity_ShouldThrowException_WhenBatchNotInCart() {
    // Given
    int validQuantity = 3;

    when(cartRepository.findByUserAndBatchId(testUser, testBatch.getIdBatch()))
        .thenReturn(Optional.empty());

    // When / Then
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
        cartService.updateBatchQuantity(testUser, testBatch.getIdBatch(), validQuantity)
    );

    assertEquals("Le batch spécifié n'existe pas dans le panier.", exception.getMessage());
    verify(cartRepository).findByUserAndBatchId(testUser, testBatch.getIdBatch());
    verify(cartRepository, never()).updateBatchQuantity(any(), anyLong(), anyInt());
  }
}