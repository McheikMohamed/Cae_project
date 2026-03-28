package be.vinci.ipl.cae.demo.configurations;

import be.vinci.ipl.cae.demo.configuration.BcryptConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class BcryptConfigurationTest {

    @Test
    void passwordEncoder_ShouldReturnBCryptPasswordEncoder() {
        BcryptConfiguration config = new BcryptConfiguration();
        BCryptPasswordEncoder encoder = config.passwordEncoder();

        assertNotNull(encoder, "Le bean BCryptPasswordEncoder ne doit pas être null.");
        assertInstanceOf(BCryptPasswordEncoder.class, encoder, "L'instance doit être un BCryptPasswordEncoder.");

        // Test de chiffrement
        String rawPassword = "monMotDePasse";
        String hashed = encoder.encode(rawPassword);

        assertNotEquals(rawPassword, hashed, "Le mot de passe encodé doit être différent du mot de passe original.");
        assertTrue(encoder.matches(rawPassword, hashed), "Le mot de passe brut doit correspondre au hash.");
    }
}
