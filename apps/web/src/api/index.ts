import axios from "axios";

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
