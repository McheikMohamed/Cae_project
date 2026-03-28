package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.CreateReservationRequest;
import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.dtos.NewProductType;
import be.vinci.ipl.cae.demo.models.dtos.NewUnit;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.BatchService;
import be.vinci.ipl.cae.demo.services.CartService;
import be.vinci.ipl.cae.demo.services.UserService;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


/**
 * Batch controller.
 */
@RestController
@RequestMapping("/batches")
public class BatchController {

  private final BatchService batchService;
  private final UserService userService;
  private final CartService cartService;

  /**
   * Constructor for BatchController.
   *
   * @param batchService the injected BatchService.
   */
  public BatchController(BatchService batchService, UserService userService,
                         CartService cartService) {
    this.batchService = batchService;
    this.userService = userService;
    this.cartService = cartService;
  }

  /**
   * Check if the ProductType is invalid.
   *
   * @param productType the product type to check
   * @return true if the product type is invalid, false otherwise.
   */
  private boolean isInvalidProductType(NewProductType productType) {
    return productType == null || productType.getLibelle() == null || productType.getLibelle()
            .isBlank();
  }

  /**
   * Check if the Unit is invalid.
   *
   * @param unit the unit to check
   * @return true if the unit is invalid, false otherwise.
   */
  private boolean isInvalidUnit(NewUnit unit) {
    return unit == null || unit.getName() == null || unit.getName().isBlank();
  }

  /**
   * Check if the product is invalid.
   *
   * @param product the product to check
   * @return true if the product is invalid, false otherwise.
   */
  private boolean isInvalidProduct(NewProduct product) {
    return product == null || product.getName() == null || product.getName().isBlank()
            || product.getDescription() == null || product.getDescription().isBlank()
            || isInvalidProductType(product.getProductType()) || isInvalidUnit(product.getUnit());
  }

  /**
   * Check if the batch is invalid.
   *
   * @param batch the batch to check
   * @return true if the batch is invalid, false otherwise.
   */
  private boolean isInvalidBatch(NewBatch batch) {
    return batch == null || batch.getReceiptDate() == null || batch.getQuantity() < 0
            || batch.getPricePerUnit() < 0 || batch.getProduct() == null || isInvalidProduct(
            batch.getProduct());
  }

  /**
   * Create a new batch.
   *
   * @param batch the batch to create
   * @return the created batch
   */
  @PostMapping("/create")
  @PreAuthorize("hasAnyRole('PRODUCER', 'DEVELOPER')")
  public Batch createBatch(@RequestPart("newBatch") NewBatch batch,
                           @RequestPart("picture") MultipartFile picture) {
    if (picture == null) {
      throw new NullPointerException("Picture cannot be null");
    }
    return createBatchInternal(batch, null, picture);
  }

  /**
   * Create a new batch.
   *
   * @param batch the batch to create
   * @return the created batch
   */
  @PostMapping("/createWithUrl")
  @PreAuthorize("hasAnyRole('PRODUCER', 'DEVELOPER')")
  public Batch createBatchWithUrl(@RequestPart("newBatch") NewBatch batch,
      @RequestPart("picture") String picture) {
    if (picture == null) {
      throw new NullPointerException("Picture URL cannot be null");
    }
    return createBatchInternal(batch, picture, null);
  }

  /**
   * Get all batches.
   *
   * @return all batches
   */
  @GetMapping("/all")
  public Iterable<Batch> getAllBatches() {
    return batchService.getAllBatches();
  }

  /**
   * Get batches from id.
   *
   * @return batches from id
   */
  @GetMapping("/{id}")
  public Batch getBatchById(@PathVariable Long id) {
    Batch batch = batchService.getBatchById(id);
    if (batch == null) {
      throw new ResourceNotFoundException();
    }
    return batch;
  }

  /**
   * Get all products.
   *
   * @return all products
   */
  @GetMapping("/products")
  public Iterable<Product> getAllProducts() {
    return batchService.getAllProducts();
  }

  /**
   * Get all product types.
   *
   * @return all product types
   */
  @GetMapping("/productTypes")
  public Iterable<ProductType> getAllProductTypes() {
    return batchService.getAllProductTypes();
  }

  /**
   * Update batch status.
   *
   * @param id the batch id
   * @param body the request body containing the reason
   * @return no content response
   */
  @PatchMapping("/{id}/status")
  public ResponseEntity<Void> updateBatchStatus(
          @PathVariable Long id,
          @RequestBody Map<String, String> body) {
    String reason = body.get("reason");
    String status = body.get("status");
    batchService.updateBatchStatus(id, status, reason);
    return ResponseEntity.noContent().build();
  }

  /**
   * Update the image of a batch.
   *
   * @param id      the id of the batch
   * @param picture the new image file
   * @return the updated batch
   */
  @PatchMapping("/{id}/updateImage")
  public ResponseEntity<Batch> updateBatchImage(
      @PathVariable Long id,
      @RequestBody MultipartFile picture) {
    try {
      Batch updatedBatch = batchService.updateBatchImage(id, picture);
      return ResponseEntity.ok(updatedBatch);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get all image URLs for batches of a specific product.
   *
   * @param productName the name of the product to search for
   * @return a list of image URLs for the specified product's batches
   */

  @GetMapping("/getImagesByProductName")
  public Iterable<String> getBatchImageUrls(@RequestParam String productName) {
    if (productName == null || productName.isBlank()) {
      throw new IllegalArgumentException("Product name cannot be null or empty");
    }

    Iterable<String> batchImageUrls = batchService.getBatchImageUrls(productName);
    if (batchImageUrls == null) {
      throw new ResourceNotFoundException();
    }
    return batchImageUrls;
  }

  /**
   * Get sell data for a batch.
   *
   * @param id the id of the batch
   * @return the sell data for the batch
   */
  @GetMapping("/sellData/{id}")
  @PreAuthorize("hasAnyRole('MANAGER', 'DEVELOPER')")
  public Object getBatchSellData(@PathVariable Long id) {
    System.out.println("Batch sellDataId : " + id);
    Object sellData = batchService.getBatchSellData(id);

    // Vérifier si sellData est un tableau avant de l'afficher
    if (sellData instanceof Object[]) {
      System.out.println("Batch sellData Data : " + Arrays.deepToString((Object[]) sellData));
    } else {
      System.out.println("Batch sellData Data : " + sellData);
    }

    if (sellData == null) {
      throw new ResourceNotFoundException();
    }
    // Retourne directement l'objet pour que Spring le convertisse correctement en JSON
    return sellData;
  }
  /**
   * Get yearly sell data for a batch.
   *
   * @param id the id of the batch
   * @return the yearly sell data for the batch
   */

  @GetMapping("/sellDataYear/{id}")
  @PreAuthorize("hasAnyRole('MANAGER', 'DEVELOPER')")
  public Object getBatchSellDataYear(@PathVariable Long id) {
    System.out.println("Batch sellDataYearId : "
            + id);
    Object sellDataYear = batchService.getBatchSellDataYear(id);

    // Vérifier si sellDataYear est un tableau avant de l'afficher
    if (sellDataYear instanceof Object[]) {
      System.out.println("Batch sellDataYear Data : " + Arrays.deepToString((Object[])
              sellDataYear));
    } else {
      System.out.println("Batch sellDataYear Data : " + sellDataYear);
    }

    if (sellDataYear == null) {
      throw new ResourceNotFoundException();
    }
    // Retourne directement l'objet pour que Spring le convertisse correctement en JSON
    return sellDataYear;
  }

  /**
   * Get a ProductType by its libelle.
   *
   * @param dto the product type libelle
   * @return the product type
   */
  @PostMapping("/AddProductTypes")
  public ResponseEntity<?> createProductType(@RequestBody NewProductType dto) {
    try {
      ProductType created = batchService.createProductType(dto.getLibelle());
      return ResponseEntity.status(HttpStatus.CREATED).body(created);
    } catch (IllegalArgumentException e) {
      // Renvoyer un message personnalisé si le type de produit existe déjà
      return ResponseEntity.status(HttpStatus.CONFLICT).body("Le type de produit existe déjà.");
    }
  }

  /**
   * Update an existing product type's libelle.
   *
   * @param oldLibelle the current libelle of the product type to update
   * @param body       a map containing the new libelle with key "libelle"
   * @return ResponseEntity containing the updated ProductType or error message
   */
  @PatchMapping("/productTypes/{oldLibelle}")
  @PreAuthorize("hasAnyRole('MANAGER', 'DEVELOPER')")
  public ResponseEntity<?> updateProductType(@PathVariable String oldLibelle,
                                             @RequestBody Map<String, String> body) {
    String newLibelle = body.get("libelle");
    try {
      ProductType updated = batchService.updateProductType(oldLibelle, newLibelle);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
  }




  private Batch createBatchInternal(NewBatch batch,
      @Nullable String imageSource,
      @Nullable MultipartFile picture) {
    System.out.println("Batch reçu : " + batch);
    System.out.println("Picture reçu : " + imageSource);
    if (isInvalidBatch(batch)) {
      System.out.println("Validation échouée pour le batch : " + batch);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batch 1");
    }

    try {
      Batch newBatch = picture == null
              ?
          batchService.createBatchWithUrl(batch, imageSource) :
          batchService.createBatch(batch, picture);

      if (newBatch == null) {
        System.out.println("newBatch est null après appel du service.");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batch 2");
      }
      return newBatch;
    } catch (Exception e) {
      System.out.println("Erreur lors de la création du batch : " + e.getMessage());
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batch 3", e);
    }
  }

  /**
   * Create a free sale.
   *
   * @param requestBody the reservation to create.
   */
  @SuppressWarnings("CPD-START")
  @PostMapping("/addRemovedQuantity")
  public void updateBatchAddQuantityRemoved(@RequestBody CreateReservationRequest requestBody,
                                            HttpServletRequest request) {
    if (requestBody == null || requestBody.getCart().isEmpty()) {
      throw new IllegalArgumentException("Invalid free sale");
    }
    User user = userService.getUser(request);
    batchService.addRemovedQuantity(requestBody.getCart());
    cartService.deleteCartByUser(user);
  }

  /**
   * Create a free sale.
   *
   * @param requestBody the reservation to create.
   */
  @PostMapping("/subRemovedQuantity")
  public void updateBatchSubQuantityRemoved(@RequestBody CreateReservationRequest requestBody,
                                            HttpServletRequest request) {
    if (requestBody == null || requestBody.getCart().isEmpty()) {
      throw new IllegalArgumentException("Invalid free sale");
    }
    User user = userService.getUser(request);
    batchService.subRemovedQuantity(requestBody.getCart());
    cartService.deleteCartByUser(user);
  }

}
