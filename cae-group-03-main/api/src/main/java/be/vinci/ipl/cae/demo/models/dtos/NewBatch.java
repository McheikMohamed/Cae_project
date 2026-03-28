package be.vinci.ipl.cae.demo.models.dtos;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewBatch DTO.
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewBatch {

  private int idBatch;

  private Date receiptDate;

  private int quantity;

  private float pricePerUnit;

  private NewProduct product;

  private NewUser producer;

}
