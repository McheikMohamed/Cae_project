package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.FreeSaleLine;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for FreeSaleLine entity.
 * This interface extends CrudRepository to provide CRUD operations for FreeSaleLine.
 */
public interface FreeSaleLineRepository extends CrudRepository<FreeSaleLine, Long> {
}
