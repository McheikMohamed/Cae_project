import { useState, useContext, useEffect } from 'react';
import {
  Container,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { BatchContext } from '../../contexts/BatchContext';

const Dashboard = () => {
  const {
    batchs,
    createProductType,
    updateProductType,
    productTypes,
    fetchProductTypes,
  } = useContext(BatchContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [addedType, setAddedType] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<string | null>(null);

  useEffect(() => {
    if (addedType !== null) {
      fetchProductTypes();
      setAddedType(null);
    }
  }, [addedType, fetchProductTypes]);

  const filteredBatchs = batchs.filter(
    (batch) => batch.status === 'available' || batch.status === 'removed',
  );

  const uniqueProducts = Array.from(
    new Map(
      filteredBatchs.map((batch) => [batch.product.idProduct, batch.product]),
    ).values(),
  );

  const productTypesExisting = Array.from(
    new Set(uniqueProducts.map((product) => product.productType.libelle)),
  );

  const filteredProducts = uniqueProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType
      ? product.productType.libelle === filterType
      : true;
    return matchesSearch && matchesType;
  });

  const handleAddType = async () => {
    try {
      if (isEditMode && typeToEdit) {
        await updateProductType(typeToEdit, newTypeName);
        setSuccessMessage('Type de produit modifié avec succès !');
      } else {
        await createProductType(newTypeName);
        setSuccessMessage('Type de produit enregistré avec succès !');
      }
      setOpenDialog(false);
      setNewTypeName('');
      setTypeToEdit(null);
      setIsEditMode(false);
      setAddedType(newTypeName);
      setErrorMessage('');
    } catch (error) {
      console.error("Erreur lors de l'ajout ou modification du type :", error);
      setSuccessMessage('');
      setErrorMessage('Ce type existe déjà ou une erreur est survenue.');
    }
    console.log(newTypeName, isEditMode, typeToEdit);
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      {/* Barre de recherche */}
      <TextField
        fullWidth
        placeholder="Recherche..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ marginBottom: 2 }}
      />

      {/* Filtre par type */}
      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 4 }}>
        <Grid size={{ xs: 8 }}>
          <Select
            fullWidth
            displayEmpty
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">Type</MenuItem>
            {productTypesExisting.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpenDialog(true);
              setNewTypeName('');
              setIsEditMode(false);
              setTypeToEdit(null);
            }}
            sx={{
              padding: 1,
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            Ajouter/ un nouveau type
          </Button>
        </Grid>
      </Grid>

      {/* Liste des produits */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.idProduct}>
            <Link
              to={`/chart-batch/${product.idProduct}`}
              style={{ textDecoration: 'none' }}
            >
              <Card sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                <CardContent>
                  <Typography variant="body1">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type : {product.productType.libelle}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Dialog ajout/modif type */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setNewTypeName('');
          setIsEditMode(false);
          setTypeToEdit(null);
        }}
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {isEditMode
            ? 'Modifier un type de produit'
            : 'Ajouter un nouveau type de produit'}
          <Chip
            label={isEditMode ? 'Passer en ajout' : 'Passer en modification'}
            variant="outlined"
            size="small"
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (!isEditMode) {
                setTypeToEdit('');
              } else {
                setNewTypeName('');
              }
            }}
            sx={{ ml: 2, cursor: 'pointer' }}
          />
        </DialogTitle>

        <DialogContent>
          {isEditMode && (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="Ancien libellé"
                value={typeToEdit}
                disabled
              />
              <TextField
                fullWidth
                autoFocus
                margin="dense"
                label="Nouveau libellé"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}

          {!isEditMode && (
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              label="Nom du type"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
          )}

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Types déjà existants :
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {productTypes.map((type) => {
              const isMatch = type
                .toLowerCase()
                .includes(newTypeName.toLowerCase());
              return (
                <Chip
                  key={type}
                  label={type}
                  variant="outlined"
                  onClick={() => {
                    setTypeToEdit(type);
                    setIsEditMode(true);
                    setOpenDialog(true);
                    setNewTypeName('');
                  }}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: isMatch ? '#e0f7fa' : 'transparent',
                    borderColor: isMatch ? '#00bcd4' : '#ccc',
                    color: isMatch ? '#00796b' : 'inherit',
                  }}
                />
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setNewTypeName('');
              setIsEditMode(false);
              setTypeToEdit(null);
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddType}
            disabled={!newTypeName.trim() || (isEditMode && !typeToEdit)}
          >
            {isEditMode ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar erreurs */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar succès */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{ width: '100%' }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
