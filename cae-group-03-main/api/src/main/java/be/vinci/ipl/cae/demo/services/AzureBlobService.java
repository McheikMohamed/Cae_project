package be.vinci.ipl.cae.demo.services;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * AzureBlobService.
 *
 * <p>This service is responsible for uploading images to Azure Blob Storage.
 */
@Service
public class AzureBlobService {
  @Value("https://imagestoragecae03.blob.core.windows.net/")
  private String blobServiceEndpoint;

  @Value("${AZURE_BLOB_SAS_TOKEN}")
  private String sasToken;

  @Value("dev")
  private String containerName;
  /**
   * Creates a BlobClientBuilder with the specified endpoint, SAS token, and container name.
   *
   * @return a BlobClientBuilder instance
   */

  public BlobClientBuilder createBlobClientBuilder() {
    return new BlobClientBuilder()
        .endpoint(blobServiceEndpoint)
        .sasToken(sasToken)
        .containerName(containerName);
  }

  /**
   * Uploads an image to Azure Blob Storage.
   *
   * @param picture the image file to upload
   * @return the URL of the uploaded image
   */
  public String uploadImage(MultipartFile picture) {
    String imageUuid = UUID.randomUUID().toString();
    Map<String, String> metadata = new HashMap<>();
    metadata.put("originalFileName", picture.getOriginalFilename());

    BlobClient blobClient = createBlobClientBuilder()
        .blobName(imageUuid)
        .buildClient();

    try {
      blobClient.upload(picture.getInputStream(), picture.getSize(), true);
      blobClient.setMetadata(metadata);
      blobClient.setHttpHeaders(new BlobHttpHeaders().setContentType(picture.getContentType()));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return blobClient.getBlobUrl();
  }
}
