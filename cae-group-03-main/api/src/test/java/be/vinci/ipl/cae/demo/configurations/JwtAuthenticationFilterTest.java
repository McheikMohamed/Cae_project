package be.vinci.ipl.cae.demo.configurations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.configuration.JwtAuthenticationFilter;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

  @Mock
  private UserService userService;

  @Mock
  private HttpServletRequest request;

  @Mock
  private HttpServletResponse response;

  @Mock
  private FilterChain filterChain;

  @InjectMocks
  private JwtAuthenticationFilter filter;

  @BeforeEach
  void clearContext() {
    SecurityContextHolder.clearContext();
  }

  @AfterEach
  void after() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void doFilter_ValidTokenAndClientUser_SetsAuthenticationWithClientRole() throws ServletException, IOException {
    when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
    when(userService.verifyJwtToken("Bearer good.token")).thenReturn("user@x.com");

    User user = new User();
    user.setEmail("user@x.com");
    user.setRole("CLIENT");

    when(userService.readOneFromEmail("user@x.com")).thenReturn(user);

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
    assertEquals(user, auth.getPrincipal());
    Collection<?> authorities = auth.getAuthorities();
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_CLIENT")));
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_USER")));
  }

  @Test
  void doFilter_ValidTokenAndProducerUser_SetsAuthenticationWithProducerRole() throws ServletException, IOException {
    when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
    when(userService.verifyJwtToken("Bearer good.token")).thenReturn("producer@x.com");

    User user = new User();
    user.setEmail("producer@x.com");
    user.setRole("PRODUCER");

    when(userService.readOneFromEmail("producer@x.com")).thenReturn(user);

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
    assertEquals(user, auth.getPrincipal());
    Collection<?> authorities = auth.getAuthorities();
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_PRODUCER")));
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_USER")));
  }

  @Test
  void doFilter_ValidTokenAndManagerUser_SetsAuthenticationWithManagerRole() throws ServletException, IOException {
    when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
    when(userService.verifyJwtToken("Bearer good.token")).thenReturn("manager@x.com");

    User user = new User();
    user.setEmail("manager@x.com");
    user.setRole("MANAGER");

    when(userService.readOneFromEmail("manager@x.com")).thenReturn(user);

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
    assertEquals(user, auth.getPrincipal());
    Collection<?> authorities = auth.getAuthorities();
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_MANAGER")));
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_USER")));
  }

  @Test
  void doFilter_ValidTokenAndVolunteerUser_SetsAuthenticationWithVolunteerRole() throws ServletException, IOException {
    when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
    when(userService.verifyJwtToken("Bearer good.token")).thenReturn("volunteer@x.com");

    User user = new User();
    user.setEmail("volunteer@x.com");
    user.setRole("VOLUNTEER");

    when(userService.readOneFromEmail("volunteer@x.com")).thenReturn(user);

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
    assertEquals(user, auth.getPrincipal());
    Collection<?> authorities = auth.getAuthorities();
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_VOLUNTEER")));
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_USER")));
  }

  @Test
  void doFilter_ValidTokenAndDeveloperUser_SetsAuthenticationWithDeveloperRole() throws ServletException, IOException {
    when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
    when(userService.verifyJwtToken("Bearer good.token")).thenReturn("developer@x.com");

    User user = new User();
    user.setEmail("developer@x.com");
    user.setRole("DEVELOPER");

    when(userService.readOneFromEmail("developer@x.com")).thenReturn(user);

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(auth);
    assertTrue(auth instanceof UsernamePasswordAuthenticationToken);
    assertEquals(user, auth.getPrincipal());
    Collection<?> authorities = auth.getAuthorities();
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_DEVELOPER")));
    assertTrue(authorities.stream().anyMatch(a -> a.toString().equals("ROLE_USER")));
  }
}
