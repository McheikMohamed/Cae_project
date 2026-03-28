import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { UserContext } from '../../contexts/UserContext';
import { BatchContext } from '../../contexts/BatchContext';
import { UserContextType } from '../../types';
import { clearAuthenticatedUser } from '../../utils/session';
import Tooltip from '@mui/material/Tooltip';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const NavBar = () => {
  const { authenticatedUser, clearUser } =
    useContext<UserContextType>(UserContext);
  const { setCart } = useContext(BatchContext);
  const navigate = useNavigate();

  // Define role buttons based on the authenticated user's role
  const roleButtons = () => {
    if (!authenticatedUser) return null;
    const { role } = authenticatedUser;
    const buttons = [];

    if (['MANAGER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="all-batches"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/all-batches')}
        >
          Lots
        </Button>,
      );
    }

    if (['PRODUCER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="notifications"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/notifications')}
        >
          Mes notifications
        </Button>,
      );
    }

    if (['CLIENT', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="reservations"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/reservation')}
        >
          Mes Réservations
        </Button>,
      );
    }

    if (['PRODUCER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="create-batch"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/create-batch')}
        >
          Créer un lot
        </Button>,
        <Button
          key="batch-history"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/batch-history')}
        >
          Mes lots
        </Button>,
      );
    }

    if (['MANAGER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="register-admin"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/register-admin')}
        >
          Ajouter un Compte
        </Button>,
      );
    }

    if (['MANAGER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="manage-batches"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/manage-batches')}
        >
          Gérer les lots
        </Button>,
      );
    }

    if (['MANAGER', 'VOLUNTEER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="reservation-benevol"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/reservation-benevol')}
        >
          commandes du jour
        </Button>,
      );
    }

    if (['MANAGER', 'VOLUNTEER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="vente-libre"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/vente-libre')}
        >
          Vente libre
        </Button>,
      );
    }

    if (['CLIENT', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Tooltip title="Panier">
          <IconButton
            sx={{ ...buttonStyle, color: 'white' }}
            onClick={() => navigate('/BasketPage')}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Tooltip>,
      );
    }
    if (['MANAGER', 'VOLUNTEER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Button
          key="UpdateBatchQuantity"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/update-batch-quantity')}
        >
          Gestion des lots
        </Button>,
      );
    }
    if (['DEVELOPER', 'MANAGER'].includes(role)) {
      buttons.push(
        <Button
          key="dashboard"
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate('/dashboard')}
        >
          Tableau de bord
        </Button>,
      );
    }

    if (['CLIENT', 'PRODUCER', 'MANAGER', 'DEVELOPER'].includes(role)) {
      buttons.push(
        <Tooltip title="Profile">
          <IconButton
            sx={{ ...buttonStyle, color: 'white' }}
            onClick={() => navigate('/profile')}
          >
            <AccountCircleIcon />
          </IconButton>
        </Tooltip>,
      );
    }

    // Deconnexion button : remove cart and clear user session
    buttons.push(
      <Tooltip title="Se déconnecter">
        <IconButton
          sx={{ ...buttonStyle, color: 'white' }}
          onClick={() => {
            clearUser();
            clearAuthenticatedUser();
            setCart([]);
            navigate('/login');
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>,
    );

    return buttons;
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#2E5635', paddingX: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* LOGO */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Typography
            variant="h6"
            sx={{ textDecoration: 'none', color: 'white', mr: 2 }}
          >
            Terroir & Cie
          </Typography>
          {authenticatedUser && (
            <Typography variant="h6" sx={{ color: 'white' }}>
              Bonjour, {authenticatedUser.firstName}
            </Typography>
          )}
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {authenticatedUser ? (
            roleButtons()
          ) : (
            <>
              <Button
                variant="contained"
                sx={buttonStyle}
                onClick={() => navigate('/register')}
              >
                S'inscrire
              </Button>
              <Tooltip title="Se connecter">
                <IconButton
                  sx={{ ...buttonStyle, color: 'white' }}
                  onClick={() => navigate('/login')}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Style for the buttons
const buttonStyle = {
  borderRadius: '15px',
  bgcolor: '#D67F65',
  '&:hover': { bgcolor: '#C76A50' },
  marginRight: 1,
};

export default NavBar;
