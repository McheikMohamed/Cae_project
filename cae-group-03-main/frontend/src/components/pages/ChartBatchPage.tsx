import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState, useMemo } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { BarChart, BarSeriesType } from '@mui/x-charts';

const ChartBatchPage = () => {
  const { batchId } = useParams();
  const {
    batchs,
    getBatchSellData,
    batchSellData,
    getBatchSellDataYear,
    batchSellDataYear,
  } = useContext(BatchContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const batch = batchs.find(
    (batch) => batch.idBatch === parseInt(batchId || '', 10),
  );

  useEffect(() => {
    if (batchId) {
      getBatchSellData(batchId).catch((err) => {
        console.error(
          'Erreur lors de la récupération des données de vente:',
          err,
        );
      });
      getBatchSellDataYear(batchId).catch((err) => {
        console.error(
          'Erreur lors de la récupération des données de vente par année:',
          err,
        );
      });
    }
  }, [batchId, getBatchSellData, getBatchSellDataYear]);

  console.log('Batch ID:', batchId);
  console.log('batchSellData:', batchSellData);
  console.log('batchSellDataYear:', batchSellDataYear);

  const { receivedData, soldData } = useMemo(() => {
    const recu = Array(12).fill(0);
    const vendu = Array(12).fill(0);

    if (batchSellData) {
      batchSellData
        .filter((data) => data.year === selectedYear)
        .forEach((data) => {
          const monthIndex = data.month - 1;
          recu[monthIndex] = data.totalReceivedQuantity || 0;
          vendu[monthIndex] = data.totalSoldQuantity || 0;
        });
    }

    return { receivedData: recu, soldData: vendu };
  }, [batchSellData, selectedYear]);

  const minYear = useMemo(() => {
    if (batchSellData && batchSellData.length > 0) {
      return Math.min(...batchSellData.map((data) => data.year));
    }
    return new Date().getFullYear();
  }, [batchSellData]);

  if (!batch) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Typography variant="h5" color="error">
          Lot introuvable
        </Typography>
      </Container>
    );
  }

  const maxYear = new Date().getFullYear();
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  const months = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];

  const yearlyLabels: string[] = [];
  const yearlyReceived: number[] = [];
  const yearlySold: number[] = [];

  if (batchSellDataYear && batchSellDataYear.length > 0) {
    batchSellDataYear.forEach((data) => {
      yearlyLabels.push(data.year.toString());
      yearlyReceived.push(data.totalReceivedQuantity || 0);
      yearlySold.push(data.totalSoldQuantity || 0);
    });
  }

  const series: BarSeriesType[] = [
    {
      data: receivedData,
      label: 'Quantité reçue',
      id: 'recu',
      type: 'bar',
    },
    {
      data: soldData,
      label: 'Quantité vendue',
      id: 'vendu',
      type: 'bar',
    },
  ];

  const yearlySeries: BarSeriesType[] = [
    {
      data: yearlyReceived,
      label: 'Total reçu (année)',
      id: 'recu_annee',
      type: 'bar',
    },
    {
      data: yearlySold,
      label: 'Total vendu (année)',
      id: 'vendu_annee',
      type: 'bar',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>
        Statistiques du produit: {batch.product.name}
      </Typography>

      <Typography variant="h5" sx={{ mt: 6 }}>
        Statistiques Mensuelles
      </Typography>
      {/* Filter by year */}
      <FormControl sx={{ marginY: 2, minWidth: 120 }}>
        <InputLabel id="year-select-label">Année</InputLabel>
        <Select
          labelId="year-select-label"
          value={selectedYear}
          label="Année"
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Charts */}
      <Box sx={{ height: 400 }}>
        <BarChart
          xAxis={[{ id: 'mois', data: months, scaleType: 'band' }]}
          series={series}
          height={400}
          margin={{ top: 40, right: 30, bottom: 50, left: 50 }}
        />
      </Box>

      <Typography variant="h5" sx={{ mt: 6 }}>
        Statistiques annuelles
      </Typography>
      <Box sx={{ height: 400, mt: 2 }}>
        <BarChart
          xAxis={[{ id: 'annee', data: yearlyLabels, scaleType: 'band' }]}
          series={yearlySeries}
          height={400}
          margin={{ top: 40, right: 30, bottom: 50, left: 50 }}
        />
      </Box>
    </Container>
  );
};

export default ChartBatchPage;
