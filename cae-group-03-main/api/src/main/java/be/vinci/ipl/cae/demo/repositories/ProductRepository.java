package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository Product.
 */
@Repository
public interface ProductRepository extends CrudRepository<Product, Long> {

  /**
  * Find a product by its name.
  *
  * @param name the name of the product
  * @return the product with the given name, or null if not found
  */
  Product findByName(String name);

}
