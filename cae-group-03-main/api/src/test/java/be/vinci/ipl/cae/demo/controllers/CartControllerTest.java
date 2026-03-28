package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.AddToCartRequest;
import be.vinci.ipl.cae.demo.models.dtos.CartItem;
import be.vinci.ipl.cae.demo.models.dtos.UpdateQuantityRequest;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Cart;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.CartService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;


@ExtendWith(MockitoExtension.class)
class CartControllerTest {

  @Mock
  private CartService cartService;

  @Mock
  private UserService userService;

  @Mock
  private HttpServletRequest request;

  @InjectMocks
  private CartController cartController;

  @Test
  public void testGetAllCarts_WithExistingCarts() {
    // Arrange
    User user = new User();
    user.setIdUser(1L);
    user.setLastName("testuser");

    Batch batch1 = new Batch();
    batch1.setIdBatch(1L);

    Batch batch2 = new Batch();
    batch2.setIdBatch(2L);

    CartItem item1 = new CartItem(batch1, 2);
    CartItem item2 = new CartItem(batch2, 1);

    List<CartItem> expectedCartItems = Arrays.asList(item1, item2);

    when(userService.getUser(request)).thenReturn(user);
    when(cartService.getBatchesByUser(user)).thenReturn(expectedCartItems);

    // Act
    List<CartItem> result = cartController.getAllCarts(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(expectedCartItems, result);

    verify(userService, times(1)).getUser(request);
    verify(cartService, times(1)).getBatchesByUser(user);
  }

  @Test
  public void testGetAllCarts_WithEmptyCart() {
    // Arrange
    User user = new User();
    user.setIdUser(2L);
    user.setFirstName("emptyCartUser");

    List<CartItem> emptyCartItems = Collections.emptyList();

    when(userService.getUser(request)).thenReturn(user);
    when(cartService.getBatchesByUser(user)).thenReturn(emptyCartItems);

    // Act
    List<CartItem> result = cartController.getAllCarts(request);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.size());

    verify(userService, times(1)).getUser(request);
    verify(cartService, times(1)).getBatchesByUser(user);
  }

  @Test
  public void testGetAllCarts_HandlesNullUser() {
    // Arrange
    when(userService.getUser(request)).thenReturn(null);
    when(cartService.getBatchesByUser(null)).thenReturn(Collections.emptyList());

    // Act
    List<CartItem> result = cartController.getAllCarts(request);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.size());

    verify(userService, times(1)).getUser(request);
    verify(cartService, times(1)).getBatchesByUser(null);
  }

  @Test
  void addCart_Valid_CallsServiceAndReturnsCart() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User();
    user.setIdUser(10L);
    when(userService.getUser(req)).thenReturn(user);

    AddToCartRequest dto = new AddToCartRequest();
    dto.setIdBatch(5L);
    dto.setQuantity(3);

    Cart saved = new Cart();
    saved.setId(7L);
    when(cartService.addToCart(user, 5L, 3)).thenReturn(saved);

    Cart result = cartController.addCart(dto, req);

    assertNotNull(result);
    assertEquals(7L, result.getId());
    verify(userService).getUser(req);
    verify(cartService).addToCart(user, 5L, 3);
  }

  @Test
  void deleteCart_Valid_CallsService() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User();
    user.setIdUser(12L);
    when(userService.getUser(req)).thenReturn(user);

    // no exception expected
    cartController.deleteCart(8L, req);

    verify(userService).getUser(req);
    verify(cartService).deleteCartByUserAndBatch(user, 8L);
  }

  @Test
  void deleteCart_ServiceThrows_PropagatesException() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User();
    when(userService.getUser(req)).thenReturn(user);
    doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND))
      .when(cartService).deleteCartByUserAndBatch(user, 9L);

    assertThrows(ResponseStatusException.class,
      () -> cartController.deleteCart(9L, req));

    verify(cartService).deleteCartByUserAndBatch(user, 9L);
  }

  @Test
  void updateBatchQuantity_Valid_CallsService() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User();
    user.setIdUser(13L);
    when(userService.getUser(req)).thenReturn(user);

    UpdateQuantityRequest dto = new UpdateQuantityRequest();
    dto.setQuantity(5);

    // no exception expected
    cartController.updateBatchQuantity(15L, dto, req);

    verify(userService).getUser(req);
    verify(cartService).updateBatchQuantity(user, 15L, 5);
  }

  @Test
  void updateBatchQuantity_ServiceThrows_PropagatesException() {
    HttpServletRequest req = mock(HttpServletRequest.class);
    User user = new User();
    when(userService.getUser(req)).thenReturn(user);

    UpdateQuantityRequest dto = new UpdateQuantityRequest();
    dto.setQuantity(-1);
    doThrow(new IllegalArgumentException("Invalid quantity"))
      .when(cartService).updateBatchQuantity(user, 20L, -1);

    assertThrows(IllegalArgumentException.class,
      () -> cartController.updateBatchQuantity(20L, dto, req));

    verify(cartService).updateBatchQuantity(user, 20L, -1);
  }
}
