package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository ProductType.
 */
@Repository
public interface ProductTypeRepository extends CrudRepository<ProductType, Long> {

  /**
   * Find a product type by its name.
   *
   * @param productType the name of the product type
   * @return the product type
   */
  ProductType findByLibelle(String productType);

}
