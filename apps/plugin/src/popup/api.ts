import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export async function login(
  email: string,
  password: string,
  twoFactorToken: string
) {
  const { data } = await api.post('/login', {
    email,
    password,
    twoFactorToken,
  });

  return data;
}

export async function isTokenValid(token: string): Promise<boolean> {
  let res;

  try {
    res = await api.post('/validate-token', { token });
  } catch {
    return false;
  }

  return res.status === 200;
}

export async function getEncryptedPasswords(token: string, hostname: string) {
  const { data } = await api.post(
    '/passwords/hostname',
    {
      hostname,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}
