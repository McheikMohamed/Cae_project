package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.FreeSale;
import be.vinci.ipl.cae.demo.models.entities.FreeSaleLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.FreeSaleLineRepository;
import be.vinci.ipl.cae.demo.repositories.FreeSaleRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for handling free sale operations.
 * This class is responsible for creating free sales and managing the cart.
 */
@Service
public class FreeSaleService {

  private final FreeSaleRepository freeSaleRepository;
  private final FreeSaleLineRepository freeSaleLineRepository;
  private final BatchRepository batchRepository;
  private final CartService cartService;

  /**
   * Constructor.
   *
   * @param freeSaleRepository the free sale repository
   * @param freeSaleLineRepository the free sale line repository
   * @param cartService        the user repository
   * @param batchRepository       the batch repository
   */
  public FreeSaleService(FreeSaleRepository freeSaleRepository,
                         BatchRepository batchRepository,
                         FreeSaleLineRepository freeSaleLineRepository,
                         CartService cartService) {
    this.freeSaleRepository = freeSaleRepository;
    this.batchRepository = batchRepository;
    this.freeSaleLineRepository = freeSaleLineRepository;
    this.cartService = cartService;
  }

  /**
   * Create a free sale.
   *
   * @param batches the list of batches to reserve
   */
  @Transactional
  public void createFreeSale(List<NewBatch> batches) {
    for (NewBatch batch : batches) {
      batchRepository.findById((long) batch.getIdBatch())
              .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }
    FreeSale freeSale = new FreeSale();
    freeSaleRepository.save(freeSale);

    List<FreeSaleLine> freeSaleLines = new ArrayList<>();
    for (NewBatch batch : batches) {
      FreeSaleLine freeSaleLine = new FreeSaleLine();
      freeSaleLine.setFreeSale(freeSale);
      freeSaleLine.setQuantity(batch.getQuantity());
      freeSaleLine.setBatch(batchRepository.findById((long) batch.getIdBatch()).get());
      batchRepository.updateAddQuantitySold((long) batch.getIdBatch(), freeSaleLine.getQuantity());
      freeSaleLines.add(freeSaleLine);

    }
    freeSaleLineRepository.saveAll(freeSaleLines);
  }
}


