import {
  RegisterUser,
  Credential,
  AuthenticatedUser,
  ProfileUser,
  updatePassword,
} from '../types';

export const registerUser = async (newUser: RegisterUser): Promise<void> => {
  const response = await fetch('/api/auths/register', {
    method: 'POST',
    body: JSON.stringify(newUser),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
};

export const loginUser = async (
  user: Credential,
): Promise<AuthenticatedUser> => {
  const response = await fetch('/api/auths/login', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }

  return response.json();
};

export const fetchProfile = async (token: string): Promise<ProfileUser> => {
  const response = await fetch('/api/auths/account', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }

  return response.json();
};

export const updateUserPassword = async (
  data: updatePassword,
  token: string,
): Promise<void> => {
  const response = await fetch('/api/auths/updatePassword', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
};
