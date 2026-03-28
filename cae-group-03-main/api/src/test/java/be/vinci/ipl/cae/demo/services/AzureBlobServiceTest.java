package be.vinci.ipl.cae.demo.services;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AzureBlobServiceTest {

    private AzureBlobService azureBlobService;
    private BlobClientBuilder blobClientBuilder;
    private BlobClient blobClient;

    @BeforeEach
    void setUp() {
        azureBlobService = new AzureBlobService();

        // Injecter les valeurs @Value
        ReflectionTestUtils.setField(azureBlobService, "blobServiceEndpoint", "https://fake.blob.core.windows.net/");
        ReflectionTestUtils.setField(azureBlobService, "sasToken", "fake-sas-token");
        ReflectionTestUtils.setField(azureBlobService, "containerName", "dev");

        // Mock
        blobClientBuilder = mock(BlobClientBuilder.class);
        blobClient = mock(BlobClient.class);

        // Simulation de la chaîne de création
        when(blobClientBuilder.endpoint(anyString())).thenReturn(blobClientBuilder);
        when(blobClientBuilder.sasToken(anyString())).thenReturn(blobClientBuilder);
        when(blobClientBuilder.containerName(anyString())).thenReturn(blobClientBuilder);
        when(blobClientBuilder.blobName(anyString())).thenReturn(blobClientBuilder);
        when(blobClientBuilder.buildClient()).thenReturn(blobClient);

        // Remplacer la méthode createBlobClientBuilder
        AzureBlobService spyService = spy(azureBlobService);
        doReturn(blobClientBuilder).when(spyService).createBlobClientBuilder();

        azureBlobService = spyService;
    }

    @Test
    void createBlobClientBuilder_ShouldReturnNonNullBuilder() {
        BlobClientBuilder builder = azureBlobService.createBlobClientBuilder();
        assertNotNull(builder);
    }


    @Test
    void uploadImage_successfulUpload_returnsUrl() throws IOException {
        // Préparer un fichier simulé
        byte[] content = "test-image-content".getBytes();
        MockMultipartFile mockFile = new MockMultipartFile("image", "image.png", "image/png", content);

        // Simuler un URL de retour
        when(blobClient.getBlobUrl()).thenReturn("https://fake.blob.core.windows.net/dev/image.png");

        // Appel
        String resultUrl = azureBlobService.uploadImage(mockFile);

        // Vérification
        verify(blobClient).upload(any(InputStream.class), eq((long) content.length), eq(true));
        verify(blobClient).setMetadata(argThat(metadata -> "image.png".equals(metadata.get("originalFileName"))));
        verify(blobClient).setHttpHeaders(argThat(headers -> "image/png".equals(headers.getContentType())));

        assertEquals("https://fake.blob.core.windows.net/dev/image.png", resultUrl);
    }

    @Test
    void uploadImage_whenIOExceptionThrown_throwsRuntimeException() throws IOException {
        // Préparer un fichier mocké
        MultipartFile file = mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("image.jpg");
        when(file.getSize()).thenReturn(123L);
        when(file.getContentType()).thenReturn("image/jpeg");

        // Simuler une exception lors de getInputStream()
        when(file.getInputStream()).thenThrow(new IOException("error"));

        // Attendre une RuntimeException
        assertThrows(RuntimeException.class, () -> azureBlobService.uploadImage(file));
    }
}