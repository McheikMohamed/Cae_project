package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AddToCartRequest;
import be.vinci.ipl.cae.demo.models.dtos.CartItem;
import be.vinci.ipl.cae.demo.models.dtos.UpdateQuantityRequest;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Cart;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.CartService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


/**
 * Contrôleur REST pour la gestion des paniers d'utilisateurs.
 */
@RestController
@RequestMapping("/carts")
public class CartController {
  private final CartService cartService;
  private final UserService userService;


  /**
   * Constructeur pour CartController.
   *
   * @param cartService le service de panier injecté.
   * @param userService le service d'utilisateur injecté.
   */
  public CartController(CartService cartService, UserService userService) {
    this.cartService = cartService;
    this.userService = userService;
  }

  /**
   * Ajoute un lot (batch) au panier de l'utilisateur identifié par son token.
   *
   * @param requestBody   L'object envoye dans le body
   * @param request La requête HTTP contenant le header Authorization (JWT).
   * @return L'objet {@link Cart} créé.
   * @throws ResponseStatusException si le token est manquant ou invalide.
   */
  @PostMapping("/add")
  @PreAuthorize("hasAnyRole('CLIENT', 'DEVELOPER','VOLUNTEER')")
  public Cart addCart(@RequestBody AddToCartRequest requestBody, HttpServletRequest request) {
    User user = userService.getUser(request);
    return cartService.addToCart(user, requestBody.getIdBatch(), requestBody.getQuantity());
  }

  /**
   * Récupère tous les lots (batches) présents dans le panier de l'utilisateur.
   *
   * @param request La requête HTTP contenant le header Authorization (JWT).
   * @return Une liste de {@link Batch} présents dans le panier.
   * @throws ResponseStatusException si le token est manquant ou invalide.
   */
  @GetMapping("/")
  public List<CartItem> getAllCarts(HttpServletRequest request) {
    User user = userService.getUser(request);
    return cartService.getBatchesByUser(user);
  }


  /**
   * Supprime un élément du panier en fonction de l'id du batch et de l'utilisateur connecté.
   *
   * @param batchId L'identifiant du batch à retirer du panier.
   * @param request La requête HTTP contenant le header Authorization (JWT).
   */
  @DeleteMapping("/delete/{batchId}")
  @PreAuthorize("hasAnyRole('CLIENT', 'DEVELOPER','VOLUNTEER')")
  public void deleteCart(@PathVariable Long batchId, HttpServletRequest request) {
    User user = userService.getUser(request);
    cartService.deleteCartByUserAndBatch(user, batchId);
  }

  /**
   * Updates the quantity of a specific batch in the authenticated user's cart.
   * This endpoint receives a batch ID as a path variable and the new quantity
   * via the request body. It uses the authenticated user obtained from the HTTP request.
   *
   * @param batchId     the ID of the batch to update in the cart
   * @param request     the request body containing the new quantity
   * @param httpRequest the HTTP request used to retrieve the authenticated user
   */
  @PatchMapping("/updateQuantity/{batchId}")
  public void updateBatchQuantity(
          @PathVariable Long batchId,
          @RequestBody UpdateQuantityRequest request,
          HttpServletRequest httpRequest) {
    User user = userService.getUser(httpRequest);
    cartService.updateBatchQuantity(user, batchId, request.getQuantity());
  }
}

