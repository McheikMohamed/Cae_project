package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.CreateReservationRequest;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.CartService;
import be.vinci.ipl.cae.demo.services.FreeSaleService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling free sale operations.
 * This class is responsible for creating free sales and managing the cart.
 */
@RestController
@RequestMapping("/freesale")
public class FreeSaleController {

  private final FreeSaleService freeSaleService;
  private final CartService cartService;
  private final UserService userService;
  /**
   * Constructor for FreeSaleController.
   *
   * @param freeSaleService the injected FreeSaleService.
   */

  public FreeSaleController(FreeSaleService freeSaleService,
                            CartService cartService, UserService userService) {
    this.freeSaleService = freeSaleService;
    this.cartService = cartService;
    this.userService = userService;
  }

  /**
   * Create a free sale.
   *
   * @param requestBody the reservation to create.
   */
  @PostMapping("/")
  public void createFreeSale(@RequestBody CreateReservationRequest requestBody,
                             HttpServletRequest request) {
    if (requestBody == null || requestBody.getCart().isEmpty()) {
      throw new IllegalArgumentException("Invalid free sale");
    }
    User user = userService.getUser(request);
    freeSaleService.createFreeSale(requestBody.getCart());
    cartService.deleteCartByUser(user);
  }
}