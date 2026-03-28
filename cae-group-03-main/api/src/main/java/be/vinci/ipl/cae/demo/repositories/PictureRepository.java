package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Picture;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Picture repository.
 */
@Repository
public interface PictureRepository extends CrudRepository<Picture, Long> {

  /**
     * Find a picture by its address.
     *
     * @param pictureAddress the address of the picture
     * @return the picture
     */
  Picture findByAddress(String pictureAddress);

}
