import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { authenticatedUser, updatePassword } = useContext(UserContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSubmit = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setNewPasswordError(
        'Le nouveau mot de passe doit contenir au moins 8 caractères, un chiffre, une minuscule, une majuscule et un caractère spécial',
      );
      return;
    } else {
      setNewPasswordError('');
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setOldPasswordError('');

    try {
      await updatePassword({
        email: authenticatedUser?.email,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      // Affichage du Snackbar de succès
      setSnackbarMessage(
        'Le mot de passe a été modifié avec succès, vous serez redirigé vers votre page de profil.',
      );
      setOpenSnackbar(true);

      // Délai avant de rediriger
      setTimeout(() => {
        navigate('/profile');
      }, 3000); // 3 secondes de délai avant la redirection
    } catch (error) {
      console.error('Mot de passe incorrect', error);
      setOldPasswordError('Mot de passe incorrect');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: '500px',
          padding: 5,
          borderRadius: '20px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" sx={{ color: '#2E5635', mb: 2 }}>
          Changer le mot de passe
        </Typography>

        <Box sx={{ width: '100%' }}>
          <TextField
            label="Ancien mot de passe"
            type={showOldPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              setOldPasswordError('');
            }}
            error={!!oldPasswordError}
            helperText={oldPasswordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Nouveau mot de passe"
            type={showNewPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setNewPasswordError('');
            }}
            error={!!newPasswordError}
            helperText={newPasswordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirmer le nouveau mot de passe"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            bgcolor: '#D67F65',
            '&:hover': { backgroundColor: '#C66B58' },
            width: '80%',
            borderRadius: '20px',
            mb: 2,
          }}
          onClick={handleSubmit}
        >
          Changer le mot de passe
        </Button>

        <Divider sx={{ width: '100%', my: 3 }} />

        <Button
          variant="text"
          onClick={() => navigate('/profile')}
          sx={{
            color: '#2E5635',
            textTransform: 'none',
            '&:hover': { color: '#D67F65' },
          }}
        >
          Retour au profil
        </Button>
      </Paper>

      {/* Snackbar positionné juste en dessous du container */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Juste en dessous du container
        sx={{ mt: 2 }} // Ajout d'un margin-top pour l'espacement
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#4caf50', // Couleur de fond verte plus opaque
            opacity: 0.9, // Opacité légèrement augmentée
            fontWeight: 'bold', // Texte en gras pour plus de visibilité
            borderRadius: '10px', // Coins arrondis pour un effet plus doux
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChangePassword;
