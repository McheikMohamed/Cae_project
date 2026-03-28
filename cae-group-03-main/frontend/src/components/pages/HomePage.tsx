import { useState, useContext } from 'react';
import {
  Container,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  InputBase,
  Paper,
  Box,
  CardMedia,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { BatchContext } from '../../contexts/BatchContext';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';

const HomePage = () => {
  const { batchs } = useContext(BatchContext);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  // ne garder que les lots disponibles ET avec une quantité restante > 0
  const filteredBatchs = batchs
    .filter((b) => b.status === 'available')
    .filter((b) => {
      const sold = b.soldQuantity ?? 0;
      const reserved = b.reservedQuantity ?? 0;
      const removed = b.removedQuantity ?? 0;
      const initial = b.quantity ?? 0;
      return initial - sold - reserved - removed > 0;
    })
    .filter((b) =>
      filterType ? b.product.productType.libelle === filterType : true,
    )
    .filter((b) =>
      search
        ? b.product.name.toLowerCase().includes(search.toLowerCase()) ||
          b.product.description.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  // idem pour le carrousel : derniers lots encore restants
  const latestAvailableBatchs = batchs
    .filter((b) => b.status === 'available')
    .filter((b) => {
      const sold = b.soldQuantity ?? 0;
      const reserved = b.reservedQuantity ?? 0;
      const removed = b.removedQuantity ?? 0;
      const initial = b.quantity ?? 0;
      return initial - sold - reserved - removed > 0;
    })
    .sort(
      (a, b) =>
        new Date(b.receiptDate || 0).getTime() -
        new Date(a.receiptDate || 0).getTime(),
    )
    .slice(0, 6);

  const productTypes = Array.from(
    new Set(batchs.map((b) => b.product.productType.libelle)),
  );

  const sectionStyle = {
    backgroundColor: '#4C8C4A',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '20px',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Bar */}
      <Paper
        component="form"
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          p: '4px 8px',
          borderRadius: 2,
          bgcolor: '#D67F65',
          '&:hover': { bgcolor: '#C66B58' },
        }}
      >
        <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
        <InputBase
          fullWidth
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {/* Carrousel Swiper */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Derniers produits récents
        </Typography>
        <Swiper
          modules={[Autoplay, EffectCoverflow, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          coverflowEffect={{
            rotate: 20,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
          pagination={{ clickable: true }}
          style={{ paddingBottom: '30px' }}
        >
          {latestAvailableBatchs.map((batch) => (
            <SwiperSlide key={batch.idBatch}>
              <Link
                to={`/batch/${batch.idBatch}`}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    backgroundColor: '#FDF6EB',
                    cursor: 'pointer',
                    maxWidth: 300,
                    mx: 'auto',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                    boxShadow: 3,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={batch.imageLocation}
                    alt={batch.product.name}
                  />
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {batch.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {batch.pricePerUnit}€
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Selection par type */}
      <Box sx={sectionStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2, color: '#FDF6EB' }}>
            Trier par type de produit
          </Typography>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            displayEmpty
            sx={{
              bgcolor: '#FFF',
              borderRadius: 1,
              px: 1,
            }}
          >
            <MenuItem value="">Tous</MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Grille des lots filtrés */}
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {filteredBatchs.length > 0 ? (
            filteredBatchs.map((batch) => (
              <Grid key={batch.idBatch} size={{ xs: 12, sm: 6, md: 4 }}>
                <Link
                  to={`/batch/${batch.idBatch}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      backgroundColor: '#FDF6EB',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 20px rgba(164, 121, 4, 0.85)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={batch.imageLocation}
                      alt={batch.product.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{batch.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {batch.pricePerUnit}€
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Typography mt={2}>Aucun produit trouvé.</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
