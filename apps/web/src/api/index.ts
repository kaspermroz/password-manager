import axios from "axios";
import { encrypt } from "../utils/crypto";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function generateSecret(email: string, password: string) {
  const { data } = await api.post("/register/generate-2fa", {
    email,
    password,
  });

  return data;
}

export async function register(
  email: string,
  password: string,
  twoFactorToken: string,
  twoFactorSecret: string
) {
  const { data } = await api.post("/register", {
    email,
    password,
    twoFactorSecret,
    twoFactorToken,
  });

  return data;
}

export async function login(
  email: string,
  password: string,
  twoFactorToken: string
) {
  const { data } = await api.post("/login", {
    email,
    password,
    twoFactorToken,
  });

  return data;
}

export async function isTokenValid(token: string): Promise<boolean> {
  const res = await api.post("/validate-token", { token });

  return res.status === 200;
}

export async function getEncryptedPasswords(token: string) {
  const { data } = await api.get("/passwords", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function storePassword(
  hostname: string,
  username: string,
  password: string,
  secret: string,
  token: string
) {
  const encryptedPassword = encrypt(password, secret);

  await api.post(
    "/passwords",
    { hostname, username, encryptedPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
