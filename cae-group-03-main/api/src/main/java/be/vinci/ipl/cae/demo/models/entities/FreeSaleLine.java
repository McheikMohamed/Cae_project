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
 * Entity representing a free sale line.
 * This class is used to map the free_sales_lines table in the database.
 */
@Entity
@Table(name = "free_sales_lines")
@Data
@NoArgsConstructor
public class FreeSaleLine {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idFreeSaleLine;

  private int quantity;

  @ManyToOne
  private Batch batch;

  @ManyToOne
  private FreeSale freeSale;

}
