package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Batch repository.
 */
@Repository
public interface BatchRepository extends CrudRepository<Batch, Long> {

  /**
   * Find a batch by its ID.
   *
   * @param id the ID of the batch
   * @return the batch with the given ID, or null if not found
   */
  @Query("SELECT b FROM Batch b WHERE b.idBatch = ?1")
  Batch findByBatchId(Long id);

  @Override
  Iterable<Batch> findAll();
  /**
   * Get the monthly received and sold quantities for a specific product.
   *
   * @param productId the ID of the product
   * @return une liste d’Object[] contenant :
   *         [0]=id_product (Long),
   *         [1]=month (Double),
   *         [2]=year (Double),
   *         [3]=total_received_quantity (BigDecimal ou Long),
   *         [4]=total_sold_quantity (BigDecimal ou Long)
   */

  @Query(value =
          "WITH received_per_month AS (\n"
                  +
                  "    SELECT\n"
                  +
                  "        b.product_id_product AS id_product,\n"
                  +
                  "        DATE_PART('month', b.receipt_date) AS month,\n"
                  +
                  "        DATE_PART('year', b.receipt_date) AS year,\n"
                  +
                  "        SUM(b.quantity) AS total_received_quantity\n"
                  +
                  "    FROM batches b\n"
                  +
                  "    WHERE b.product_id_product = ?1\n"
                  +
                  "    GROUP BY b.product_id_product,\n"
                  +
                  "             DATE_PART('year', b.receipt_date),\n"
                  +
                  "             DATE_PART('month', b.receipt_date)\n"
                  +
                  "),\n"
                  +
                  "sold_per_month AS (\n"
                  +
                  "    SELECT\n"
                  +
                  "        b.product_id_product AS id_product,\n"
                  +
                  "        DATE_PART('month', r.recovery_date) AS month,\n"
                  +
                  "        DATE_PART('year', r.recovery_date) AS year,\n"
                  +
                  "        SUM(rl.quantity) AS total_sold_quantity\n"
                  +
                  "    FROM reservation_lines rl\n"
                  +
                  "    JOIN reservations r ON rl.reservation_id_reservation = r.id_reservation\n"
                  +
                  "    JOIN batches b ON rl.batch_id_batch = b.id_batch\n"
                  +
                  "    WHERE b.product_id_product = ?1\n"
                  +
                  "    GROUP BY b.product_id_product,\n"
                  +
                  "             DATE_PART('year', r.recovery_date),\n"
                  +
                  "             DATE_PART('month', r.recovery_date)\n"
                  +
                  ")\n"
                  +
                  "SELECT\n"
                  +
                  "    COALESCE(r.id_product, s.id_product)       AS id_product,\n"
                  +
                  "    COALESCE(r.month,          s.month)        AS month,\n"
                  +
                  "    COALESCE(r.year,           s.year)         AS year,\n"
                  +
                  "    COALESCE(r.total_received_quantity, 0)     AS total_received_quantity,\n"
                  +
                  "    COALESCE(s.total_sold_quantity,     0)     AS total_sold_quantity\n"
                  +
                  "FROM received_per_month r\n"
                  +
                  "FULL OUTER JOIN sold_per_month    s\n"
                  +
                  "  ON r.year  = s.year\n"
                  +
                  " AND r.month = s.month\n"
                  +
                  "ORDER BY year, month",
          nativeQuery = true)
  List<Object[]> findMonthlyReceivedAndSoldQuantitiesByProductId(Long productId);


  /**
   * Get the yearly received and sold quantities for a specific product.
   *
   * @param productId the ID of the product
   * @return a list of Object arrays
   */
  @Query(value =
          "WITH received_per_year AS (\n"
                  +
                  "    SELECT\n"
                  +
                  "        DATE_PART('year', b.receipt_date) AS year,\n"
                  +
                  "        b.product_id_product AS id_product,\n"
                  +
                  "        SUM(b.quantity) AS total_received_quantity\n"
                  +
                  "    FROM batches b\n"
                  +
                  "    WHERE b.product_id_product = ?1\n"
                  +
                  "    GROUP BY DATE_PART('year', b.receipt_date), b.product_id_product\n"
                  +
                  "),\n"
                  +
                  "sold_per_year AS (\n"
                  +
                  "    SELECT\n"
                  +
                  "        DATE_PART('year', r.recovery_date) AS year,\n"
                  +
                  "        b.product_id_product AS id_product,\n"
                  +
                  "        SUM(rl.quantity) AS total_sold_quantity\n"
                  +
                  "    FROM reservation_lines rl\n"
                  +
                  "    JOIN reservations r ON rl.reservation_id_reservation = r.id_reservation\n"
                  +
                  "    JOIN batches b ON rl.batch_id_batch = b.id_batch\n"
                  +
                  "    WHERE b.product_id_product = ?1\n"
                  +
                  "    GROUP BY DATE_PART('year', r.recovery_date), b.product_id_product\n"
                  +
                  ")\n"
                  +
                  "SELECT\n"
                  +
                  "    COALESCE(r.id_product, s.id_product) AS id_product,\n"
                  +
                  "    COALESCE(r.year, s.year) AS year,\n"
                  +
                  "    COALESCE(r.total_received_quantity, 0) AS total_received_quantity,\n"
                  +
                  "    COALESCE(s.total_sold_quantity, 0) AS total_sold_quantity\n"
                  +
                  "FROM received_per_year r\n"
                  +
                  "FULL OUTER JOIN sold_per_year s ON r.year = s.year\n"
                  +
                  "ORDER BY year",
          nativeQuery = true)
  List<Object[]> findYearlyReceivedAndSoldQuantitiesByProductId(Long productId);

  /**
   * Update the quantity reserved for a batch.
   *
   * @param idBatch the ID of the batch
   * @param quantity the new reserved quantity
   */
  @Modifying
  @Transactional
  @Query(value = "UPDATE batches SET reserved_quantity = reserved_quantity + ?2"
          + " WHERE id_batch = ?1", nativeQuery = true)
  void updateAddQuantityReserved(Long idBatch, int quantity);

  /**
   * Update the quantity reserved for a batch.
   *
   * @param idBatch the ID of the batch
   * @param quantity the new reserved quantity
   */
  @Modifying
  @Transactional
  @Query(value = "UPDATE batches SET reserved_quantity = reserved_quantity - ?2"
          + " WHERE id_batch = ?1", nativeQuery = true)
  void updateSubQuantityReserved(Long idBatch, int quantity);

  /**
   * Update the quantity reserved for a batch.
   *
   * @param idBatch the ID of the batch
   * @param quantity the new reserved quantity
   */
  @Modifying
  @Transactional
  @Query(value = "UPDATE batches SET sold_quantity = sold_quantity + ?2"
          + " WHERE id_batch = ?1", nativeQuery = true)
  void updateAddQuantitySold(Long idBatch, int quantity);


  /**
   * Update the quantity reserved for a batch.
   *
   * @param idBatch the ID of the batch
   * @param quantity the new reserved quantity
   */
  @Modifying
  @Transactional
  @Query(value = "UPDATE batches SET removed_quantity = removed_quantity + ?2"
          + " WHERE id_batch = ?1", nativeQuery = true)
  void updateAddRemovedQuantity(Long idBatch, int quantity);

  /**
   * Update the quantity reserved for a batch.
   *
   * @param idBatch the ID of the batch
   * @param quantity the new reserved quantity
   */
  @Modifying
  @Transactional
  @Query(value = "UPDATE batches SET removed_quantity = removed_quantity - ?2"
          + " WHERE id_batch = ?1", nativeQuery = true)
  void updateSubRemovedQuantity(Long idBatch, int quantity);

}
