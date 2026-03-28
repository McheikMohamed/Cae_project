import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const LoginPage = () => {
  const { loginUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayConnected, setStayConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const user = { email, password, StayConnected: stayConnected };
    try {
      const loggedInUser = await loginUser(user);
      if (loggedInUser.role === 'PRODUCER') {
        navigate('/batch-history');
      } else if (loggedInUser.role === 'MANAGER') {
        navigate('/dashboard');
      } else if (loggedInUser.role === 'VOLUNTEER') {
        navigate('/reservation-benevol');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('LoginPage::error: ', err);
      setErrorMessage('Email ou mot de passe incorrect');
    }
  };

  const handleEmailInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setEmail(input.value);
  };

  const handlePasswordChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setPassword(input.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left part: Form */}
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          backgroundColor: '#FDF6EB',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '80%', maxWidth: 400 }}>
          <Typography variant="h4" gutterBottom>
            Connexion
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={handleEmailInputChange}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '15px' },
              }}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'} // Change le type en fonction de l'état
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
              required
              color="primary"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '15px' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stayConnected}
                    onChange={(e) => setStayConnected(e.target.checked)}
                  />
                }
                label="Rester connecté"
                id="StayConnected"
                name="StayConnected"
              />
            </FormGroup>
            {errorMessage && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                borderRadius: '15px',
                backgroundColor: '#FFFFFF',
                color: '#000',
                border: '1px solid black',
                '&:hover': { backgroundColor: '#D67F65' },
                mb: 2,
              }}
            >
              confirmer
            </Button>
            <Link
              href="/register"
              sx={{ textAlign: 'center', color: '#979797' }}
            >
              S'inscrire
            </Link>
          </form>
        </Box>
      </Grid>

      {/* Right part: Green part */}
      <Grid size={{ xs: 12, md: 7 }} sx={{ backgroundColor: '#4D8C57' }} />
    </Grid>
  );
};

export default LoginPage;
