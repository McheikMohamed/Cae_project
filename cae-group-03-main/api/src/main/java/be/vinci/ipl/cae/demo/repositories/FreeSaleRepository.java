package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.FreeSale;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for FreeSale entity.
 * This interface extends CrudRepository to provide CRUD operations for FreeSale.
 */
public interface FreeSaleRepository extends CrudRepository<FreeSale, Long> {
}
