package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Batch entity.
 */
@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
public class Batch {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idBatch;

  @Column(nullable = false)
  private Date receiptDate;

  @Column(nullable = false)
  private int quantity;

  @Column(nullable = false)
  private int removedQuantity;

  @Column(nullable = false)
  private int reservedQuantity;

  @Column(nullable = false)
  private int soldQuantity;

  @Column(nullable = false)
  private float pricePerUnit;

  @Column(nullable = false)
  private String status; // (ex: waiting, available, refused, removed.)

  @Column(nullable = true)
  private String imageLocation;

  @Column(nullable = true)
  private String rejectionReason;

  @ManyToOne
  private Product product;

  @ManyToOne
  private User producer;

}
