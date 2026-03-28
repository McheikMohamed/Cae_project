package be.vinci.ipl.cae.demo;

import me.paulschwarz.springdotenv.DotenvPropertySource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication(scanBasePackages = "be.vinci.ipl.cae.demo")
public class DemoApplication {
  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    try (AnnotationConfigApplicationContext applicationContext =
                 new AnnotationConfigApplicationContext()) {
      // Add DotenvPropertySource to environment before registering components
      DotenvPropertySource.addToEnvironment(applicationContext.getEnvironment());
      SpringApplication.run(DemoApplication.class, args);
    }
  }
}