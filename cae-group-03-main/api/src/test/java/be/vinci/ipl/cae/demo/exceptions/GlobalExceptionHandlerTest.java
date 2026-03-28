package be.vinci.ipl.cae.demo.exceptions;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

  @Mock
  private WebRequest webRequest;

  @Mock
  private HttpServletRequest httpRequest;

  @InjectMocks
  private GlobalExceptionHandler handler;

  private AccessDeniedException accessDeniedException;
  private Exception genericException;

  @BeforeEach
  void setUp() {
    accessDeniedException = new AccessDeniedException("Access denied");
    genericException = new RuntimeException("Some error occurred");

    when(webRequest.getDescription(false)).thenReturn("uri=/test");
    when(webRequest.getDescription(true)).thenReturn("uri=/test");
    when(httpRequest.getMethod()).thenReturn("GET");
  }
/*
  @Test
  void handleAccessDeniedException_WithoutAuthorizationHeader_ReturnsUnauthorized() {
    // Arrange
    when(webRequest.getHeader("Authorization")).thenReturn(null);

    // Act
    ResponseEntity<?> response = handler.handleAccessDeniedException(
            accessDeniedException, webRequest, httpRequest);

    // Assert
    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertNull(response.getBody()); // car la méthode renvoie null comme body dans ce cas
  }
*/


  @Test
  void handleAccessDeniedException_WithAuthorizationHeader_ReturnsForbidden() {
    // Arrange
    when(webRequest.getHeader("Authorization")).thenReturn("Bearer xyz");

    // Act
    ResponseEntity<?> response = handler.handleAccessDeniedException(
            accessDeniedException, webRequest, httpRequest);

    // Assert
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());

    Object body = response.getBody();
    assertNotNull(body);
    assertTrue(body instanceof ErrorDetails);

    ErrorDetails errorDetails = (ErrorDetails) body;
    assertEquals(HttpStatus.FORBIDDEN.value(), errorDetails.getStatusCode());
  }


  @Test
  void handleGlobalException_ReturnsInternalServerError() {
    // Act
    ResponseEntity<?> response = handler.handleGlobalException(
            genericException, webRequest, httpRequest);

    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());

    Object body = response.getBody();
    assertNotNull(body);
    assertTrue(body instanceof ErrorDetails);

    ErrorDetails errorDetails = (ErrorDetails) body;
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), errorDetails.getStatusCode());
  }


  @Test
  void handleResourceNotFound_withMessage_returnsErrorDetails() {
    ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
    ResponseEntity<?> resp = handler.handleResourceNotFoundException(ex, webRequest, httpRequest);

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    assertTrue(resp.hasBody());
    ErrorDetails details = (ErrorDetails) resp.getBody();
    assertEquals(404, details.getStatusCode());
    assertTrue(details.getMessage().contains("Not found"));
    assertTrue(details.getDetails().contains("uri=/test"));
  }

  @Test
  void handleResourceNotFound_withoutMessage_returnsStatusOnly() {
    ResourceNotFoundException ex = new ResourceNotFoundException();
    ResponseEntity<?> resp = handler.handleResourceNotFoundException(ex, webRequest, httpRequest);

    assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    assertFalse(resp.hasBody());
  }

  @Test
  void handleResponseStatusException_withReason_returnsErrorDetails() {
    ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bad req");
    ResponseEntity<?> resp = handler.handleResponseStatusException(ex, webRequest, httpRequest);

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertTrue(resp.hasBody());
    ErrorDetails details = (ErrorDetails) resp.getBody();
    assertEquals(400, details.getStatusCode());
    assertTrue(details.getMessage().contains("Bad req"));
  }

  @Test
  void handleResponseStatusException_withoutReason_returnsStatusOnly() {
    ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST);
    ResponseEntity<?> resp = handler.handleResponseStatusException(ex, webRequest, httpRequest);

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertFalse(resp.hasBody());
  }

}
