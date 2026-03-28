package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.dtos.NewProductType;
import be.vinci.ipl.cae.demo.models.dtos.NewUnit;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.entities.*;
import be.vinci.ipl.cae.demo.repositories.*;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class BatchServiceTest {

  @Mock
  private BatchRepository batchRepository;
  @Mock
  private ProductRepository productRepository;
  @Mock
  private ProductTypeRepository productTypeRepository;
  @Mock
  private UnitRepository unitRepository;
  @Mock
  private UserRepository userRepository;
  @Mock
  private MultipartFile mockPicture;
  @Mock
  private AzureBlobService azureBlobService;

  @Spy
  @InjectMocks
  private BatchService batchService;

  private NewProduct newProduct;
  private NewProductType newProductType;
  private Product product;
  private NewUser newUser;
  private User user;
  private Batch batch;
  private NewBatch newBatch;

  @BeforeEach
  void setUp() {
    newProduct = new NewProduct();
    NewUnit newUnit = new NewUnit();
    newUnit.setName("kg");
    newProductType = new NewProductType();
    newProductType.setLibelle("Fruit");
    newProduct.setName("Apple");
    newProduct.setDescription("Fresh Apples");
    newProduct.setProductType(newProductType);
    newProduct.setUnit(newUnit);

    newUser = new NewUser();
    newUser.setEmail("test@example.com");

    newBatch = new NewBatch();
    newBatch.setProduct(newProduct);
    newBatch.setProducer(newUser);
    newBatch.setQuantity(100);
    newBatch.setPricePerUnit(2.5F);

    product = new Product();

    user = new User();
    user.setEmail("test@example.com");

    batch = new Batch();
    batch.setProduct(product);
    batch.setProducer(user);
    batch.setQuantity(100);
    batch.setPricePerUnit(2.5F);

    Unit unit = new Unit();
    unit.setName("kg");
    ProductType productType = new ProductType();
    productType.setLibelle("Fruit");
    product.setName("Apple");
    product.setDescription("Fresh Apples");
    product.setProductType(productType);
    product.setUnit(unit);
  }

  @Test
  void createProduct_WithExistingProductTypeAndUnit_ShouldUseExistingEntities() {
    // Arrange
    ProductType existingProductType = new ProductType();
    existingProductType.setLibelle("Fruit");

    Unit existingUnit = new Unit();
    existingUnit.setName("Kg");

    when(productTypeRepository.findByLibelle("Fruit")).thenReturn(existingProductType);
    when(unitRepository.findByName("Kg")).thenReturn(existingUnit);
    when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Product createdProduct = batchService.createProduct("Apple", "Fresh Apples", "Fruit", "Kg");

    // Assert
    assertNotNull(createdProduct);
    assertEquals("Apple", createdProduct.getName());
    assertEquals("Fruit", createdProduct.getProductType().getLibelle());
    assertEquals("Kg", createdProduct.getUnit().getName());

    verify(productTypeRepository).findByLibelle("Fruit");
    verify(unitRepository).findByName("Kg");
    verify(productRepository).save(any(Product.class));
  }


  @Test
  void createBatch_WithImageAndProductDoesNotExist_ShouldCallCreateProduct() {
    // Arrange
    // Configuration des mocks pour le produit inexistant
    when(productRepository.findByName(anyString())).thenReturn(null);
    when(productRepository.save(any(Product.class))).thenReturn(product);

    // Configuration des mocks pour les types et unités
    ProductType productType = new ProductType();
    productType.setLibelle("Fruit");
    Unit unit = new Unit();
    unit.setName("kg");
    when(productTypeRepository.findByLibelle(anyString())).thenReturn(null);
    when(unitRepository.findByName(anyString())).thenReturn(null);
    when(productTypeRepository.save(any(ProductType.class))).thenReturn(productType);
    when(unitRepository.save(any(Unit.class))).thenReturn(unit);

    // Configuration du mock pour l'utilisateur
    when(userRepository.findByEmail(anyString())).thenReturn(user);

    // Configuration du mock pour l'image
    String expectedBlobUrl = "https://example.blob.core.windows.net/images/uuid";
    when(azureBlobService.uploadImage(mockPicture)).thenReturn(expectedBlobUrl);

    // Configuration du mock pour la sauvegarde du batch
    when(batchRepository.save(any(Batch.class))).thenAnswer(i -> {
      Batch savedBatch = (Batch) i.getArgument(0);
      savedBatch.setIdBatch(1L);
      return savedBatch;
    });

    // Act
    Batch result = batchService.createBatch(newBatch, mockPicture);

    // Assert
    assertNotNull(result);
    assertEquals(expectedBlobUrl, result.getImageLocation());
    assertEquals("waiting", result.getStatus());
    assertEquals(0, result.getReservedQuantity());
    assertEquals(0, result.getRemovedQuantity());
    assertEquals(0, result.getSoldQuantity());
    assertEquals(newBatch.getQuantity(), result.getQuantity());
    assertEquals(newBatch.getPricePerUnit(), result.getPricePerUnit());

    // Verify
    verify(productRepository).findByName(newBatch.getProduct().getName());
    verify(productTypeRepository).findByLibelle(newBatch.getProduct().getProductType().getLibelle());
    verify(unitRepository).findByName(newBatch.getProduct().getUnit().getName());
    verify(productRepository).save(any(Product.class));
    verify(azureBlobService).uploadImage(mockPicture);
    verify(batchRepository).save(any(Batch.class));
    verify(userRepository).findByEmail(newBatch.getProducer().getEmail());
  }

  @Test
  void getAllBatches_ShouldReturnBatches() {
    batchService.getAllBatches();
    verify(batchRepository).findAll();
  }

  @Test
  void getBatchById_ShouldReturnBatchIfExists() {
    when(batchRepository.findById(anyLong())).thenReturn(Optional.of(batch));

    Batch foundBatch = batchService.getBatchById(1L);
    assertNotNull(foundBatch);
    assertEquals(100, foundBatch.getQuantity());
  }

  @Test
  void getBatchById_ShouldReturnNullIfNotExists() {
    when(batchRepository.findById(anyLong())).thenReturn(Optional.empty());

    Batch foundBatch = batchService.getBatchById(1L);
    assertNull(foundBatch);
  }

  @Test
  void getAllProducts_ShouldReturnAllProducts() {
    // GIVEN
    List<Product> products = List.of(product);
    when(productRepository.findAll()).thenReturn(products);

    // WHEN
    Iterable<Product> result = batchService.getAllProducts();

    // THEN
    assertNotNull(result);
    assertEquals(1, ((List<Product>) result).size());
    verify(productRepository, times(1)).findAll();
  }

  @Test
  void getAllProductTypes_ShouldReturnAllProductTypes() {
    ProductType productType = new ProductType();
    productType.setLibelle("Fruit");

    // GIVEN
    List<ProductType> productTypes = List.of(productType);
    when(productTypeRepository.findAll()).thenReturn(productTypes);

    // WHEN
    Iterable<ProductType> result = batchService.getAllProductTypes();

    // THEN
    assertNotNull(result);
    assertEquals(1, ((List<ProductType>) result).size());
    verify(productTypeRepository, times(1)).findAll();
  }

  @Test
  void updateBatchStatus_BatchExists_UpdatesStatusAndReason() {
    // Arrange
    batch.setStatus("pending");
    batch.setRejectionReason(null);
    when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
    when(batchRepository.save(any(Batch.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    Batch result = batchService.updateBatchStatus(1L, "rejected", null);

    // Assert
    assertNotNull(result);
    assertEquals("rejected", result.getStatus());
    assertEquals(null, result.getRejectionReason());
    verify(batchRepository).findById(1L);
    verify(batchRepository).save(batch);
  }

  @Test
  void updateBatchStatus_RefusedStatus_SetsRejectionReason() {
    // Arrange
    batch.setStatus("pending");
    batch.setRejectionReason(null);
    when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
    when(batchRepository.save(any(Batch.class))).thenAnswer(inv -> inv.getArgument(0));

    String reason = "Invalid documents";

    // Act
    Batch result = batchService.updateBatchStatus(1L, "refused", reason);

    // Assert
    assertNotNull(result);
    assertEquals("refused", result.getStatus());
    assertEquals(reason, result.getRejectionReason());
    verify(batchRepository).findById(1L);
    verify(batchRepository).save(batch);
  }
/*
  @Test
void getBatchSellData_ShouldReturnSellData_WhenBatchExists() {
    // GIVEN
    Long batchId = 1L;
    List<Object[]> expectedSellData = (List<Object[]>) List.of(new Object[] { "2025-04", 100 }); // Exemple de données
    when(batchRepository.findMonthlySumByBatchId(batchId)).thenReturn(expectedSellData);

    // WHEN
    List<Object[]> result = (List<Object[]>) batchService.getBatchSellData(batchId);

    // THEN
    assertNotNull(result);
    assertEquals(expectedSellData, result);
    verify(batchRepository, times(1)).findMonthlySumByBatchId(batchId);
}
*/
@Test
void getBatchSellData_ShouldReturnNull_WhenBatchDoesNotExist() {
    // GIVEN
    Long batchId = 1L;
    when(batchRepository.findMonthlyReceivedAndSoldQuantitiesByProductId(batchId)).thenReturn(null);

    // WHEN
    List<Object[]> result = (List<Object[]>) batchService.getBatchSellData(batchId);

    // THEN
    assertNull(result);
    verify(batchRepository, times(1)).findMonthlyReceivedAndSoldQuantitiesByProductId(batchId);
}
}