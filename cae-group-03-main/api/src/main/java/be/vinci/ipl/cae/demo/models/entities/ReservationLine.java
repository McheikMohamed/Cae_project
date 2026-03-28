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
 * ReservationLine entity.
 */
@Entity
@Table(name = "reservation_lines")
@Data
@NoArgsConstructor
public class ReservationLine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idReservationLine;

  private int quantity;

  @ManyToOne
  private Batch batch;
  @ManyToOne
  private Reservation reservation;

}
