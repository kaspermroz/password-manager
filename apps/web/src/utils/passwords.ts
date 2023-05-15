import CryptoJS from "crypto-js";

export const encrypt = (password: string, secret: string) => {
  const cipherText = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    secret
  ).toString();
  return cipherText;
};

export const decrypt = (password: string, secret: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(password, secret);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch {
    console.error("Invalid secret!");
    return "";
  }
};

function copyToClipboardFallback(decryptedPassword: string) {
  const textarea = document.createElement("textarea");
  textarea.value = decryptedPassword;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  console.log("Password copied to clipboard using fallback method");
}

export async function copyToClipboard(decryptedPassword: string) {
  if (navigator.clipboard) {
    try {
      setTimeout(
        async () => await navigator.clipboard.writeText(decryptedPassword),
        500
      );
    } catch (err) {
      console.error("Failed to copy password to clipboard:", err);
    }
  } else {
    copyToClipboardFallback(decryptedPassword);
  }
}
