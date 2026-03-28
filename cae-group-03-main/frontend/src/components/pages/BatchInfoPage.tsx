import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {
  Container,
  Typography,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  Input,
} from '@mui/material';

const BatchInfoPage = () => {
  const { batchId } = useParams();
  const { batchs, updateBatchImage } = useContext(BatchContext);
  const [editedImage, setEditedImage] = useState<File | undefined>(undefined);

  const batch = batchs.find((b) => b.idBatch === parseInt(batchId || '', 10));

  if (!batch) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Typography variant="h5" color="error">
          Lot introuvable
        </Typography>
      </Container>
    );
  }

  const handleSaveImage = async (batchId: number, image: File) => {
    try {
      await updateBatchImage(batchId, image);
      setEditedImage(undefined); // Réinitialiser l'état après la sauvegarde
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image :", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        {batch.imageLocation && (
          <CardMedia
            component="img"
            height="250"
            image={batch.imageLocation}
            alt={batch.product.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {batch.product.name}
          </Typography>

          <Divider sx={{ marginY: 2 }} />

          <Typography variant="body1" gutterBottom>
            {batch.product.description}
          </Typography>

          <Box mt={2}>
            <Typography variant="body2">
              <strong>Type :</strong> {batch.product.productType.libelle}
            </Typography>
            <Typography variant="body2">
              <strong>Unité :</strong> {batch.product.unit.name}
            </Typography>
            <Typography variant="body2">
              <strong>Prix par unité :</strong> {batch.pricePerUnit} €
            </Typography>
            <Typography variant="body2">
              <strong>Quantité disponible :</strong>{' '}
              {(batch.quantity ?? 0) -
                (batch.soldQuantity ?? 0) -
                (batch.removedQuantity ?? 0) -
                (batch.reservedQuantity ?? 0)}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<PhotoCamera />}
              sx={{
                height: 56,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderColor: '#115293',
                },
              }}
            >
              {editedImage ? editedImage.name : "Modifier l'image"}
              <Input
                type="file"
                inputProps={{ accept: 'image/*' }}
                sx={{ display: 'none' }}
                onChange={(event) => {
                  const file = (event.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setEditedImage(file);
                  }
                }}
              />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (editedImage && batch.idBatch !== undefined) {
                  await handleSaveImage(batch.idBatch, editedImage);
                  setEditedImage(undefined); // Réinitialiser l'état après la sauvegarde
                }
              }}
              disabled={!editedImage} // Désactiver si aucune image n'est modifiée
            >
              Valider
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BatchInfoPage;
