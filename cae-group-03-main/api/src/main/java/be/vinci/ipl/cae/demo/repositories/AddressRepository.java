package be.vinci.ipl.cae.demo.repositories;


import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Country;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Address repository.
 */
@Repository
public interface AddressRepository extends CrudRepository<Address, Integer> {

  /**
   * Find an address by its street, number, box, postal code, city and country.
   *
   * @param street     the street of the address
   * @param number     the number of the address
   * @param box        the box of the address
   * @param postalCode the postal code of the address
   * @param city       the city of the address
   * @param country    the country of the address
   * @return the address entity
   */
  Address findByStreetAndNumberAndBoxAndPostalCodeAndCityAndCountry(String street, String number,
      String box, int postalCode, String city, Country country);

}
