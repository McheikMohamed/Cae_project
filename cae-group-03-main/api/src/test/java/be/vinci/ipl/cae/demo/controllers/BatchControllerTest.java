package be.vinci.ipl.cae.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.dtos.NewProductType;
import be.vinci.ipl.cae.demo.models.dtos.NewUnit;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.services.BatchService;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BatchControllerTest {

  @Mock
  private BatchService batchService;

  @InjectMocks
  private BatchController batchController;

  @Test
  void getAllBatches_ReturnsIterableOfBatches() {
    Batch b1 = new Batch(); b1.setIdBatch(1L);
    Batch b2 = new Batch(); b2.setIdBatch(2L);
    when(batchService.getAllBatches()).thenReturn(List.of(b1, b2));

    Iterable<Batch> result = batchController.getAllBatches();

    assertNotNull(result);
    assertEquals(2, ((List<Batch>) result).size());
    verify(batchService).getAllBatches();
  }

  @Test
  void getBatchById_ExistingId_ReturnsBatch() {
    Batch b = new Batch(); b.setIdBatch(5L);
    when(batchService.getBatchById(5L)).thenReturn(b);

    Batch result = batchController.getBatchById(5L);

    assertEquals(5L, result.getIdBatch());
    verify(batchService).getBatchById(5L);
  }

  @Test
  void getBatchById_NonExistingId_ThrowsResourceNotFound() {
    when(batchService.getBatchById(99L)).thenReturn(null);

    assertThrows(ResourceNotFoundException.class, () -> batchController.getBatchById(99L));
    verify(batchService).getBatchById(99L);
  }

  @Test
  void getAllProducts_ReturnsIterableOfProducts() {
    Product p1 = new Product(); p1.setIdProduct(1L);
    Product p2 = new Product(); p2.setIdProduct(2L);
    when(batchService.getAllProducts()).thenReturn(List.of(p1, p2));

    Iterable<Product> result = batchController.getAllProducts();

    assertEquals(2, ((List<Product>) result).size());
    verify(batchService).getAllProducts();
  }

  @Test
  void getAllProductTypes_ReturnsIterableOfProductTypes() {
    ProductType pt1 = new ProductType(); pt1.setIdProductType(10L);
    ProductType pt2 = new ProductType(); pt2.setIdProductType(20L);
    when(batchService.getAllProductTypes()).thenReturn(List.of(pt1, pt2));

    Iterable<ProductType> result = batchController.getAllProductTypes();

    assertEquals(2, ((List<ProductType>) result).size());
    verify(batchService).getAllProductTypes();
  }

  @Test
  void updateBatchStatus_ValidBody_ReturnsNoContent() {
    Map<String, String> body = new HashMap<>();
    body.put("status", "approved");
    body.put("reason", "OK");

    // stub the non-void service method to return a Batch
    when(batchService.updateBatchStatus(7L, "approved", "OK"))
      .thenReturn(new Batch());

    ResponseEntity<Void> resp = batchController.updateBatchStatus(7L, body);

    assertEquals(204, resp.getStatusCodeValue());
    verify(batchService).updateBatchStatus(7L, "approved", "OK");
  }

  @Test
  void updateBatchStatus_ServiceThrows_PropagatesException() {
    Map<String, String> body = Map.of("status", "rejected", "reason", "Bad");

    // use thenThrow for non-void method
    when(batchService.updateBatchStatus(8L, "rejected", "Bad"))
      .thenThrow(new ResourceNotFoundException());

    assertThrows(ResourceNotFoundException.class,
      () -> batchController.updateBatchStatus(8L, body));
    verify(batchService).updateBatchStatus(8L, "rejected", "Bad");
  }

  @Test
  void getBatchSellData_Existing_ReturnsObject() {
    Object[] sellData = new Object[] {42L, 100, "2025-04"};
    when(batchService.getBatchSellData(3L)).thenReturn(sellData);

    Object result = batchController.getBatchSellData(3L);

    assertSame(sellData, result);
    verify(batchService).getBatchSellData(3L);
  }

  @Test
  void getBatchSellData_NotFound_ThrowsResourceNotFound() {
    when(batchService.getBatchSellData(4L)).thenReturn(null);

    assertThrows(ResourceNotFoundException.class, () -> batchController.getBatchSellData(4L));
    verify(batchService).getBatchSellData(4L);
  }

  @Test
  void createBatch_ValidMultipart_ReturnsBatch() {
    NewBatch dto = new NewBatch();
    dto.setReceiptDate(Date.from(LocalDate.of(2025, 4, 1).atStartOfDay()
            .atZone(java.time.ZoneId.systemDefault()).toInstant()));
    dto.setQuantity(10);
    dto.setPricePerUnit(5.0F);
    dto.setProduct(new NewProduct("N", "D",
            new NewProductType("T"), new NewUnit("U")));
    NewUser userDto = new NewUser();
    userDto.setEmail("u@x.com");
    // set any other required NewUser fields, e.g.:
    // userDto.setFirstName("John");
    // userDto.setLastName("Doe");
    // userDto.setPassword("secret");
    dto.setProducer(userDto);

    MockMultipartFile pic = new MockMultipartFile(
            "picture", "img.png", "image/png", new byte[]{1,2,3});
    Batch created = new Batch(); created.setIdBatch(9L);

    when(batchService.createBatch(eq(dto), any())).thenReturn(created);

    Batch result = batchController.createBatch(dto, pic);

    assertEquals(9L, result.getIdBatch());
    verify(batchService).createBatch(dto, pic);
  }

  @Test
  void createBatch_InvalidDto_ThrowsBadRequest() {
    // missing required fields -> isInvalidBatch should catch
    NewBatch dto = new NewBatch();
    MockMultipartFile pic = new MockMultipartFile("picture","",null,new byte[0]);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> batchController.createBatch(dto, pic));
    assertEquals("400 BAD_REQUEST \"Invalid batch 1\"", exception.getMessage());
    verify(batchService, never()).createBatch(any(), any());
  }

  @Test
  void createBatch_ServiceReturnsNull_ThrowsBadRequest() {
    // Setup a valid NewBatch
    NewBatch dto = new NewBatch();
    dto.setReceiptDate(Date.from(LocalDate.of(2025, 4, 1).atStartOfDay()
            .atZone(java.time.ZoneId.systemDefault()).toInstant()));
    dto.setQuantity(10);
    dto.setPricePerUnit(5.0F);
    dto.setProduct(new NewProduct("Name", "Description",
            new NewProductType("Type"), new NewUnit("Unit")));
    NewUser userDto = new NewUser();
    userDto.setEmail("user@example.com");
    dto.setProducer(userDto);

    MockMultipartFile pic = new MockMultipartFile(
            "picture", "test.jpg", "image/jpeg", "test image content".getBytes());

    // Mock service to return null
    when(batchService.createBatch(any(), any())).thenReturn(null);

    // Expect a BAD_REQUEST exception with specific message
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> batchController.createBatch(dto, pic));
    assertEquals("400 BAD_REQUEST \"Invalid batch 3\"", exception.getMessage());

    // Verify service was called
    verify(batchService).createBatch(dto, pic);
  }

  @Test
  void createBatch_ServiceThrowsException_ThrowsBadRequest() {
    // Setup a valid NewBatch
    NewBatch dto = new NewBatch();
    dto.setReceiptDate(Date.from(LocalDate.of(2025, 4, 1).atStartOfDay()
            .atZone(java.time.ZoneId.systemDefault()).toInstant()));
    dto.setQuantity(10);
    dto.setPricePerUnit(5.0F);
    dto.setProduct(new NewProduct("Name", "Description",
            new NewProductType("Type"), new NewUnit("Unit")));
    NewUser userDto = new NewUser();
    userDto.setEmail("user@example.com");
    dto.setProducer(userDto);

    MockMultipartFile pic = new MockMultipartFile(
            "picture", "test.jpg", "image/jpeg", "test image content".getBytes());

    // Mock service to throw exception
    when(batchService.createBatch(any(), any())).thenThrow(new RuntimeException("Service exception"));

    // Expect a BAD_REQUEST exception with specific message
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> batchController.createBatch(dto, pic));
    assertEquals("400 BAD_REQUEST \"Invalid batch 3\"", exception.getMessage());

    // Verify service was called
    verify(batchService).createBatch(dto, pic);
  }

  @Test
  void createBatch_NullPicture_ThrowsException() {
    NewBatch dto = new NewBatch();
    dto.setReceiptDate(Date.from(LocalDate.of(2025, 4, 1).atStartOfDay()
            .atZone(java.time.ZoneId.systemDefault()).toInstant()));
    dto.setQuantity(10);
    dto.setPricePerUnit(5.0F);
    dto.setProduct(new NewProduct("Name", "Description",
            new NewProductType("Type"), new NewUnit("Unit")));
    NewUser userDto = new NewUser();
    userDto.setEmail("user@example.com");
    dto.setProducer(userDto);

    // Pass null for picture
    assertThrows(NullPointerException.class,
            () -> batchController.createBatch(dto, null));

    // Verify service was never called
    verify(batchService, never()).createBatch(any(), any());
  }
}
