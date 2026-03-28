package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a free sale.
 * This class is used to map the free_sales table in the database.
 */
@Entity
@Table(name = "free_sales")
@Data
@NoArgsConstructor
public class FreeSale {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idFreeSale;

}
        