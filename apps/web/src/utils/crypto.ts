import CryptoJS from "crypto-js";

export const encrypt = (password: string, secret: string) => {
  const cipherText = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    secret
  ).toString();
  return cipherText;
};

export const decrypt = (password: string, secret: string) => {
  const bytes = CryptoJS.AES.decrypt(password, secret);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};
