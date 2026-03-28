package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Unit;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Unit repository.
 */

@Repository
public interface UnitRepository extends CrudRepository<Unit, Long> {

  /**
   * Find a unit by its name.
   *
   * @param unit the name of the unit
   * @return the unit
   */
  Unit findByName(String unit);

}
