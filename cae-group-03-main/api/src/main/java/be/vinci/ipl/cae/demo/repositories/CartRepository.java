package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Cart;
import be.vinci.ipl.cae.demo.models.entities.User;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository pour la gestion des entités {@link Cart}.
 * Fournit des opérations CRUD et des méthodes pour accéder aux paniers d'utilisateurs.
 */
@Repository
public interface CartRepository extends CrudRepository<Cart, Long> {

  /**
   * Récupère tous les paniers associés à un utilisateur donné.
   *
   * @param user L'utilisateur dont on souhaite récupérer les paniers.
   * @return Un {@link Iterable} de {@link Cart} liés à l'utilisateur.
   */
  Iterable<Cart> findByUser(User user);

  /**
   * Récupère un panier spécifique selon l'utilisateur et l'identifiant du batch.
   *
   * @param user    L'utilisateur concerné.
   * @param batchId L'identifiant du batch présent dans le panier.
   * @return Un {@link Optional} contenant le {@link Cart} trouvé, ou vide s'il n'existe pas.
   */
  @Query("SELECT c FROM Cart c WHERE c.user = :user AND c.batch.idBatch = :batchId")
  Optional<Cart> findByUserAndBatchId(@Param("user") User user, @Param("batchId") Long batchId);

  /**
   * Supprime tous les paniers liés à un utilisateur donné.
   *
   * @param user L'utilisateur dont on souhaite supprimer tous les paniers.
   */
  void deleteAllByUser(User user);

  /**
   * Updates the quantity of a specific batch in the cart for a given user.
   * This method modifies the `quantity` field of the {@link Cart} entity where the batch ID
   * and the user match the given parameters. It is marked as a modifying query and runs
   * within a transactional context to ensure data consistency.
   *
   * @param user     the user who owns the cart
   * @param batchId  the ID of the batch to update
   * @param quantity the new quantity to set
   */
  @Modifying
  @Transactional
  @Query("UPDATE Cart c SET c.quantity = :quantity "
      + "WHERE c.user = :user AND c.batch.idBatch = :batchId")
  void updateBatchQuantity(@Param("user") User user,
      @Param("batchId") Long batchId,
      @Param("quantity") int quantity);
}

