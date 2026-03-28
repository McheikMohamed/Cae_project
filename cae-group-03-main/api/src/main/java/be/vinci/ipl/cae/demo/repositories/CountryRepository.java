package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Country;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository Country.
 */
@Repository
public interface CountryRepository extends CrudRepository<Country, Long> {

  /**
   * Find a country by its name.
   *
   * @param name the name of the country
   * @return the country entity
   */
  Country findByName(String name);

}
