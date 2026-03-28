package be.vinci.ipl.cae.demo.models.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un panier (Cart) associé à un utilisateur.
 * Un utilisateur peut avoir plusieurs paniers, chacun contenant un batch spécifique.
 */
@Entity
@Table(name = "Cart")
@Data
@NoArgsConstructor
public class Cart {

  /**
   * Identifiant unique du panier, généré automatiquement.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * La quantite du produit dans le panier.
   */
  private int quantity;

  /**
   * L'utilisateur auquel est associé ce panier.
   * Chaque utilisateur peut avoir plusieurs lignes de panier (relation ManyToOne possible).
   */
  @ManyToOne
  private User user;
  /**
   * Le lot (batch) contenu dans le panier.
   * Plusieurs utilisateurs peuvent avoir le même batch dans leur panier.
   */
  @ManyToOne
  private Batch batch;
}

