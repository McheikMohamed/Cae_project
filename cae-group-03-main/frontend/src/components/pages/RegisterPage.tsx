import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useTheme,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // Declare state for each form field
  const [honorific, setHonorific] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [box, setBox] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Belgique');
  const [company] = useState('');
  const [role] = useState('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Declare state for each form field error
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [errors, setErrors] = useState({
    honorific: false,
    lastName: false,
    firstName: false,
    street: false,
    number: false,
    box: false, // added error for box
    postalCode: false,
    city: false,
    phoneNumber: false,
    company: false,
    role: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateNumeric = (value: string) => {
    const regex = /^[0-9]+$/;
    return regex.test(value);
  };

  // Validate all fields
  const validateFields = () => {
    const newErrors = {
      honorific: honorific.trim() === '', // honorific must be selected
      lastName: lastName.trim().length < 3,
      firstName: firstName.trim().length < 3,
      street: street.trim().length < 3,
      number: !validateNumeric(number),
      box: box.trim() === '' ? false : !validateNumeric(box), // allow empty box
      postalCode: postalCode.trim().length < 3,
      city: city.trim().length < 3 || validateNumeric(city), // city cannot be solely a number
      phoneNumber: phoneNumber.trim().length < 3,
      company: false,
      role: false,
      email: email.trim().length < 3 || !validateEmail(email),
      password: password.trim().length < 3 || !validatePassword(password),
      confirmPassword: false, // removed confirmation required error
    };

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = true;
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  // Handle form submission
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitted(true); // mark that a submission has been attempted
    if (!validateFields()) {
      return;
    }

    // Verify if the password is valid
    if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: true }));
      return; // Stop the submission if password is invalid
    }
    try {
      await registerUser({
        honorific,
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        role,
        company,
        address: {
          street,
          number,
          box,
          postalCode,
          city,
          country: { name: country },
        },
      });
      navigate('/login');
    } catch (err) {
      console.error('RegisterPage::error: ', err);
      if (err instanceof Error && err.message.includes('409')) {
        setEmailError(
          'Cet email est déjà utilisé. Veuillez en choisir un autre.',
        );
      } else {
        setEmailError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    }
  };

  // Add state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Add state for submission attempt
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#4C8C4A',
        padding: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#FDF6EB',
          padding: 4,
          borderRadius: 4,
          boxShadow: 3,
          maxWidth: '900px',
          width: '100%',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Inscription
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Civilité */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={errors.honorific}>
                <InputLabel
                  id="honorific-label"
                  sx={{ color: theme.palette.secondary.contrastText }}
                >
                  Civilité
                </InputLabel>
                <Select
                  labelId="honorific-label"
                  id="honorific"
                  value={honorific}
                  label="Civilité"
                  onChange={(e) => {
                    const value = e.target.value;
                    setHonorific(value);
                    if (value.trim() !== '') {
                      setErrors((prev) => ({ ...prev, honorific: false }));
                    }
                  }}
                  sx={{
                    color: theme.palette.secondary.contrastText,
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.secondary.contrastText,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.secondary.contrastText,
                    },
                    '.MuiSvgIcon-root': {
                      color: theme.palette.secondary.contrastText,
                    },
                  }}
                >
                  <MenuItem value="Mme.">Mme.</MenuItem>
                  <MenuItem value="M.">M.</MenuItem>
                </Select>
              </FormControl>
              {isSubmitted && errors.honorific && (
                <Typography color="error" variant="caption">
                  Veuillez sélectionner une civilité (ex: Mme. ou M.)
                </Typography>
              )}
            </Grid>
            {/* Last Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Nom"
                variant="outlined"
                value={lastName}
                onChange={(e) => {
                  const value = e.target.value;
                  setLastName(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, lastName: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.lastName}
                helperText={
                  isSubmitted && errors.lastName
                    ? 'Champ incorrect (ex: Dupont)'
                    : ''
                }
              />
            </Grid>
            {/* First Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="Prenom"
                variant="outlined"
                value={firstName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFirstName(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, firstName: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.firstName}
                helperText={
                  isSubmitted && errors.firstName
                    ? 'Champ incorrect (ex: Jean)'
                    : ''
                }
              />
            </Grid>
            {/* Street */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="street"
                name="street"
                label="Rue"
                variant="outlined"
                value={street}
                onChange={(e) => {
                  const value = e.target.value;
                  setStreet(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, street: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.street}
                helperText={
                  isSubmitted && errors.street
                    ? 'Champ incorrect (ex: Rue de la République)'
                    : ''
                }
              />
            </Grid>
            {/* Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="number"
                name="number"
                label="Numero"
                variant="outlined"
                value={number}
                onChange={(e) => {
                  const value = e.target.value;
                  setNumber(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, number: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.number}
                helperText={
                  isSubmitted && errors.number
                    ? 'Veuillez entrer un numéro valide (ex: 12)'
                    : ''
                }
              />
            </Grid>
            {/* box */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="box"
                name="box"
                label="Boite"
                variant="outlined"
                value={box}
                onChange={(e) => {
                  const value = e.target.value;
                  setBox(value);
                  if (value.trim() === '' || validateNumeric(value)) {
                    setErrors((prev) => ({ ...prev, box: false }));
                  } else {
                    setErrors((prev) => ({ ...prev, box: true }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.box}
                helperText={
                  isSubmitted && errors.box
                    ? 'La boîte doit être un chiffre valide (ex: 7)'
                    : ''
                }
              />
            </Grid>
            {/* Postal Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="postalCode"
                name="postalCode"
                label="Code postal"
                variant="outlined"
                value={postalCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setPostalCode(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, postalCode: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.postalCode}
                helperText={
                  isSubmitted && errors.postalCode
                    ? 'Champ Incorrect (ex: 1000)'
                    : ''
                }
              />
            </Grid>
            {/* City */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="Ville"
                variant="outlined"
                value={city}
                onChange={(e) => {
                  const value = e.target.value;
                  setCity(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, city: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.city}
                helperText={
                  isSubmitted && errors.city
                    ? 'Champ Incorrect (ex: Bruxelles)'
                    : ''
                }
              />
            </Grid>
            {/* Country */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel
                  id="country-label"
                  sx={{ color: theme.palette.secondary.contrastText }}
                >
                  Pays
                </InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  value={country}
                  label="Pays"
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  sx={{
                    color: theme.palette.secondary.contrastText,
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.secondary.contrastText,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.secondary.contrastText,
                    },
                    '.MuiSvgIcon-root': {
                      color: theme.palette.secondary.contrastText,
                    },
                  }}
                >
                  <MenuItem value="Belgique">Belgique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Phone Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Numero de telephone"
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setPhoneNumber(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, phoneNumber: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={errors.phoneNumber}
                helperText={
                  isSubmitted && errors.phoneNumber
                    ? 'Numéro de téléphone belge invalide (ex: 0499 11 22 33)'
                    : ''
                }
              />
            </Grid>
            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setEmailError('');
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, email: false }));
                  }
                }}
                color="primary"
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                error={!!emailError || errors.email}
                helperText={
                  isSubmitted &&
                  (emailError ||
                    (errors.email
                      ? 'Email invalide (ex: nom@example.com)'
                      : ''))
                }
              />
            </Grid>
            {/* Password */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);

                  if (!validatePassword(value)) {
                    setErrors((prev) => ({ ...prev, password: true }));
                  } else {
                    setErrors((prev) => ({ ...prev, password: false }));
                  }
                }}
                color="primary"
                sx={{
                  input: { color: theme.palette.secondary.contrastText },
                }}
                error={errors.password}
                helperText={
                  isSubmitted && errors.password
                    ? 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (ex: Password1!)'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Confirm Password */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="confirmPassword"
                fullWidth
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  if (value.trim() !== '') {
                    setErrors((prev) => ({ ...prev, confirmPassword: false }));
                    if (password === value) setPasswordError(false);
                  }
                }}
                error={passwordError || errors.confirmPassword}
                helperText={
                  isSubmitted && passwordError
                    ? 'Les mots de passe ne correspondent pas'
                    : ''
                }
                sx={{ input: { color: theme.palette.secondary.contrastText } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Confirm Button */}
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: '50%',
                  borderRadius: '15px',
                  backgroundColor: '#FFFFFF',
                  color: '#000',
                  border: '1px solid black',
                  '&:hover': { backgroundColor: '#D67F65' },
                  mb: 2,
                }}
              >
                Confirmer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterPage;
