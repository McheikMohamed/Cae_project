package be.vinci.ipl.cae.demo.configurations;

import be.vinci.ipl.cae.demo.configuration.JwtAuthenticationFilter;
import be.vinci.ipl.cae.demo.configuration.SecurityConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigurationTest {

    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private SecurityConfiguration securityConfiguration;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = mock(JwtAuthenticationFilter.class);
        securityConfiguration = new SecurityConfiguration(jwtAuthenticationFilter);
    }

    @Test
    void filterChain_ShouldBuildSecurityFilterChain() throws Exception {
        HttpSecurity httpSecurity = mock(HttpSecurity.class, RETURNS_DEEP_STUBS);

        // Appelle la méthode, sans crash
        assertDoesNotThrow(() -> {
            SecurityFilterChain chain = securityConfiguration.filterChain(httpSecurity);
            assertNotNull(chain);
        });
    }
}
