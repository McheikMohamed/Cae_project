import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  Credential,
  RegisterUser,
  ProfileUser,
  updatePassword,
} from '../types';

import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';

import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  fetchProfile,
  updateUserPassword as apiUpdatePassword,
} from '../services/userApi';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {
    return {
      token: '',
      userId: '',
      email: '',
      firstName: '',
      role: '', // Replace with appropriate default values for AuthenticatedUser
    };
  },
  clearUser: () => {},
  updateToken: async () => {},
  profilUser: async () => {},
  updatePassword: async () => {},
  user: undefined,
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(getAuthenticatedUser());
  const [user, setUser] = useState<ProfileUser | undefined>(undefined);

  const registerUser = async (newUser: RegisterUser) => {
    try {
      await apiRegisterUser(newUser);
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  const loginUser = async (creds: Credential) => {
    try {
      // fetch and get new token
      const auth = await apiLoginUser(creds);
      setAuthenticatedUser(auth);
      // first clear, then persist only if creds.StayConnected === true
      storeAuthenticatedUser(auth, creds.StayConnected);
      return auth;
    } catch (e) {
      console.error('loginUser::error', e);
      throw e;
    }
  };

  const updateToken = useCallback(async () => {
    if (!authenticatedUser) return;

    console.log('Initial token: ', authenticatedUser.token);
    try {
      const response = await fetch('/api/auths/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
      }

      const newToken = await response.json();
      console.log('New token: ', newToken.token);
      setAuthenticatedUser((prevUser) => {
        if (!prevUser) return prevUser;
        return { ...prevUser, token: newToken.token };
      });
      storeAuthenticatedUser(
        { ...authenticatedUser, token: newToken.token },
        true,
      );
    } catch (err) {
      console.error('updateToken::error: ', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profilUser = useCallback(async () => {
    try {
      if (!authenticatedUser) return;
      const profileData = await fetchProfile(authenticatedUser.token);
      setUser(profileData);
    } catch (err) {
      console.error('profilUser::error: ', err);
    }
  }, [authenticatedUser]);

  const updatePassword = async (data: updatePassword) => {
    try {
      if (!authenticatedUser) return;
      await apiUpdatePassword(data, authenticatedUser.token);
    } catch (err) {
      console.error('updatePassword::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    setAuthenticatedUser(undefined);
    clearAuthenticatedUser();
  };

  useEffect(() => {
    if (authenticatedUser) {
      profilUser();
    }
  }, [authenticatedUser, profilUser]);

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
    updateToken,
    profilUser,
    updatePassword,
    user,
  };

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
