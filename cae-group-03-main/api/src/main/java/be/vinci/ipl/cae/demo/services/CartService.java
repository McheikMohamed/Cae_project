package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.CartItem;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Cart;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.CartRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;



/**
 * Service de gestion du panier (Cart).
 */
@Service
public class CartService {
  private final CartRepository cartRepository;
  private final BatchService batchService;

  /**
   * Constructeur pour CartService.
   *
   * @param cartRepository  le repository de panier injecté.
   * @param batchService    le service de lot (batch) injecté.
   */
  public CartService(CartRepository cartRepository,
                     BatchService batchService) {
    this.cartRepository = cartRepository;
    this.batchService = batchService;
  }

  /**
   * Ajoute un batch (lot) au panier de l'utilisateur.
   *
   * @param user     L'utilisateur auquel associer le panier.
   * @param idBatch L'identifiant du batch à ajouter.
   * @return Le Cart enregistré.
   */
  public Cart addToCart(User user, long idBatch, int quantity) {
    Batch batch = batchService.getBatchById(idBatch);
    Cart cart = new Cart();
    cart.setUser(user);
    cart.setBatch(batch);
    cart.setQuantity(quantity);
    return cartRepository.save(cart);
  }

  /**
   * Récupère la liste des lots dans le panier d'un utilisateur.
   *
   * @param user L'utilisateur concerné.
   * @return Une liste de Batchs présents dans le panier de l'utilisateur.
   */
  public List<CartItem> getBatchesByUser(User user) {
    Iterable<Cart> carts = cartRepository.findByUser(user);
    List<CartItem> result = new ArrayList<>();
    for (Cart cart : carts) {
      if (cart.getBatch() != null) { // ← important
        result.add(new CartItem(cart.getBatch(), cart.getQuantity()));
      }
    }
    return result;
  }

  /**
   * Supprime un élément du panier selon l'utilisateur et l'identifiant du batch.
   *
   * @param user    L'utilisateur propriétaire du panier.
   * @param batchId L'identifiant du batch à supprimer.
   * @throws ResponseStatusException si le panier n'existe pas.
   */
  public void deleteCartByUserAndBatch(User user, Long batchId) {
    Cart cart = cartRepository.findByUserAndBatchId(user, batchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

    cartRepository.delete(cart);
  }

  /**
   * Supprime tous les éléments du panier pour un utilisateur donné.
   *
   * @param user L'utilisateur dont le panier doit être vidé.
   */
  @Transactional
  public void deleteCartByUser(User user) {
    cartRepository.deleteAllByUser(user);
  }

  /**
   * Updates the quantity of a specific batch in the user's cart.
   * This method checks if the quantity is valid (> 0) and ensures that the specified
   * batch exists in the user's cart before proceeding with the update.
   * If either condition is not met, an {@link IllegalArgumentException} is thrown.
   *
   * @param user     the user whose cart is being modified
   * @param batchId  the ID of the batch to update
   * @param quantity the new quantity to set
   * @throws IllegalArgumentException if the quantity is less than or equal to 0,
   *                                  or if the batch is not found in the user's cart
   */
  public void updateBatchQuantity(User user, Long batchId, int quantity) {
    if (quantity <= 0) {
      throw new IllegalArgumentException("La quantité doit être supérieure à 0.");
    }

    Optional<Cart> cartOptional = cartRepository.findByUserAndBatchId(user, batchId);
    if (cartOptional.isEmpty()) {
      throw new IllegalArgumentException("Le batch spécifié n'existe pas dans le panier.");
    }

    cartRepository.updateBatchQuantity(user, batchId, quantity);
  }
}

