package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.repositories.UnitRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;




/**
 * Service Batch.
 */
@Service
public class BatchService {

  private final BatchRepository batchRepository;
  private final ProductRepository productRepository;
  private final ProductTypeRepository productTypeRepository;
  private final UnitRepository unitRepository;
  private final UserRepository userRepository;
  private final AzureBlobService azureBlobService;

  /**
   * Constructor.
   *
   * @param batchRepository       the batch repository
   * @param productRepository     the product repository
   * @param productTypeRepository the product type repository
   * @param unitRepository        the unit repository
   */
  public BatchService(BatchRepository batchRepository, ProductRepository productRepository,
                      ProductTypeRepository productTypeRepository, UnitRepository unitRepository,
                      UserRepository userRepository, AzureBlobService azureBlobService) {
    this.batchRepository = batchRepository;
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.unitRepository = unitRepository;
    this.userRepository = userRepository;
    this.azureBlobService = azureBlobService;
  }

  /**
   * Create a product.
   *
   * @param productName the name of the product
   * @param description the description of the product
   * @param productType the type of the product
   * @param unitName    the unit of the product
   * @return the created product
   */
  public Product createProduct(String productName, String description, String productType,
      String unitName) {
    Product product = new Product();
    product.setName(productName);
    product.setDescription(description);

    ProductType existingProductType = productTypeRepository.findByLibelle(productType);
    if (existingProductType == null) {
      ProductType newProductType = new ProductType();
      newProductType.setLibelle(productType);
      productTypeRepository.save(newProductType);
      product.setProductType(newProductType);
    } else {
      product.setProductType(existingProductType);
    }

    Unit existingUnit = unitRepository.findByName(unitName);
    if (existingUnit == null) {
      Unit unit = new Unit();
      unit.setName(unitName);
      unitRepository.save(unit);
      product.setUnit(unit);
    } else {
      product.setUnit(existingUnit);
    }

    return productRepository.save(product);
  }


  /**
   * Create a batch.
   *
   * @param batch the batch to create
   * @return the created batch
   */

  public Batch createBatch(NewBatch batch, MultipartFile picture) {
    String blobUrl = azureBlobService.uploadImage(picture);
    return createBatchWithUrl(batch, blobUrl);
  }

  /**
   * Create a batch.
   *
   * @param batch the batch to create
   * @return the created batch
   */
  public Batch createBatchWithUrl(NewBatch batch, String imageUrl) {
    Batch createdbatch = new Batch();
    assignBatch(batch, createdbatch);
    createdbatch.setImageLocation(imageUrl);
    batchRepository.save(createdbatch);
    return createdbatch;
  }

  private void assignBatch(NewBatch batch, Batch createdbatch) {
    Product product = productRepository.findByName(batch.getProduct().getName());
    if (product == null) {
      product = createProduct(batch.getProduct().getName(), batch.getProduct().getDescription(),
          batch.getProduct().getProductType().getLibelle(), batch.getProduct().getUnit().getName());
    }

    User producer = userRepository.findByEmail(batch.getProducer().getEmail());

    createdbatch.setProducer(producer);
    createdbatch.setProduct(product);
    createdbatch.setReceiptDate(batch.getReceiptDate());
    createdbatch.setQuantity(batch.getQuantity());
    createdbatch.setRemovedQuantity(0);
    createdbatch.setReservedQuantity(0);
    createdbatch.setSoldQuantity(0);
    createdbatch.setPricePerUnit(batch.getPricePerUnit());
    createdbatch.setStatus("waiting");
  }

  /**
   * Update the image of a batch.
   *
   * @param id      the id of the batch
   * @param picture the new image file
   * @return the updated batch
   * @throws IllegalArgumentException if the batch is not found or if the picture is null/empty
   */
  public Batch updateBatchImage(Long id, MultipartFile picture) {
    if (picture == null || picture.isEmpty()) {
      throw new IllegalArgumentException("Picture file cannot be null or empty");
    }

    Batch batch = batchRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

    String blobUrl = azureBlobService.uploadImage(picture);
    batch.setImageLocation(blobUrl);

    return batchRepository.save(batch);
  }

  /**
   * Retrieves all image URLs from batches associated with a specific product name.
   * The product name comparison is case-insensitive.
   *
   * @param productName the name of the product to search for
   * @return a list of image URLs from all batches matching the product name.
   *         Returns an empty list if no matches are found or if the batches don't have images.
   */

  public List<String> getBatchImageUrls(String productName) {
    String pName = productName.toLowerCase(Locale.FRENCH);
    List<String> batchImageUrls = new ArrayList<>();
    Iterable<Batch> batchs = batchRepository.findAll();
    for (Batch batch : batchs) {
      if (batch.getProduct().getName().toLowerCase(Locale.FRENCH).equals(pName)) {
        batchImageUrls.add(batch.getImageLocation());
      }
    }
    return batchImageUrls;
  }


  /**
   * Get all batches.
   *
   * @return an iterable of all batches
   */
  public Iterable<Batch> getAllBatches() {
    return batchRepository.findAll();
  }

  /**
   * Get a batch by id.
   *
   * @param id the id of the batch
   * @return the batch
   */
  public Batch getBatchById(Long id) {
    return batchRepository.findById(id).orElse(null);
  }

  /**
   * Get all products.
   *
   * @return an iterable of all products
   */
  public Iterable<Product> getAllProducts() {
    return productRepository.findAll();
  }

  /**
   * Get all product types.
   *
   * @return an iterable of all product types
   */
  public Iterable<ProductType> getAllProductTypes() {
    return productTypeRepository.findAll();
  }

  /**
   * Get sell data for a batch.
   *
   * @param id the id of the batch
   * @return the sell data for the batch
   */
  public Object getBatchSellData(Long id) {
    return batchRepository.findMonthlyReceivedAndSoldQuantitiesByProductId(id);
  }

  /**
   * Get yearly sell data for a batch.
   *
   * @param id the id of the batch
   * @return the yearly sell data for the batch
   */
  public Object getBatchSellDataYear(Long id) {
    return batchRepository.findYearlyReceivedAndSoldQuantitiesByProductId(id);
  }

  /**
   * Update the status of a batch.
   *
   * @param id     the id of the batch
   * @param status the new status
   * @param reason the reason for the status change (if applicable)
   */
  public Batch updateBatchStatus(Long id, String status, String reason) {
    Batch batch = batchRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    batch.setStatus(status);
    if ("refused".equals(status)) {
      batch.setRejectionReason(reason);
    }
    return batchRepository.save(batch);
  }

  /**
   * Get a ProductType by its libelle.
   *
   * @param libelle the name of the product type
   * @return the product type if found, null otherwise
   */
  public ProductType createProductType(String libelle) {
    ProductType existing = productTypeRepository.findByLibelle(libelle);

    if (existing != null) {
      throw new IllegalArgumentException("Ce type de produit existe déjà.");
    }

    ProductType newType = new ProductType();
    newType.setLibelle(libelle);
    return productTypeRepository.save(newType);
  }

  /**
   * Update a product type.
   *
   * @param oldLibelle the old libelle of the product type
   * @param newLibelle the new libelle of the product type
   * @return the updated product type
   */
  public ProductType updateProductType(String oldLibelle, String newLibelle) {
    if (oldLibelle.equalsIgnoreCase(newLibelle)) {
      throw new IllegalArgumentException("Le libellé est identique.");
    }

    ProductType existing = productTypeRepository.findByLibelle(newLibelle);
    if (existing != null) {
      throw new IllegalArgumentException("Un type avec ce libellé existe déjà.");
    }

    ProductType toUpdate = productTypeRepository.findByLibelle(oldLibelle);
    if (toUpdate == null) {
      throw new IllegalArgumentException("Type de produit introuvable.");
    }

    toUpdate.setLibelle(newLibelle);
    return productTypeRepository.save(toUpdate);
  }



  /**
   * Add the removed quantity to a batch.
   *
   * @param batches the list of batches to reserve
   */
  // Suppress CPD warnings for this block
  @SuppressWarnings("CPD-START")
  @Transactional
  public void addRemovedQuantity(List<NewBatch> batches) {
    for (NewBatch batch : batches) {
      batchRepository.findById((long) batch.getIdBatch())
              .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }
    for (NewBatch batch : batches) {
      batchRepository.updateAddRemovedQuantity((long) batch.getIdBatch(), batch.getQuantity());
    }
  }

  /**
   * Remove removed quantity to a batch.
   *
   * @param batches the list of batches to reserve
   */
  @Transactional
  public void subRemovedQuantity(List<NewBatch> batches) {
    for (NewBatch batch : batches) {
      batchRepository.findById((long) batch.getIdBatch())
              .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }
    for (NewBatch batch : batches) {
      batchRepository.updateSubRemovedQuantity((long) batch.getIdBatch(), batch.getQuantity());
    }
  }
  // End of suppressed CPD block
}
