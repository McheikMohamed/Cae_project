package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {

  /**
   * Find a user by its email.
   *
   * @param email the email
   * @return the user
   */
  User findByEmail(String email);

  /**
   * Update the password of a user.
   *
   * @param id       the user ID
   * @param password the new password
   */
  @Modifying
  @Query("UPDATE User u SET u.password = :password WHERE u.idUser = :id")
  void updatePassword(@Param("id") Long id, @Param("password") String password);

}
