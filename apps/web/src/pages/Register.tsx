import { useState } from "react";
import { generateSecret, register } from "../api";
import { Link, redirect, useNavigate } from "react-router-dom";
import { setSession } from "../utils/session";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    return redirect("/");
  }

  return null;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [qr, setQr] = useState("");
  const [twoFactorSectet, setTwoFactorSecret] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const secretGenerated = Boolean(qr && twoFactorSectet);

  const handleGenerateSecret: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (secretGenerated) {
      return;
    }

    const submit = async () => {
      const data = await generateSecret(email, password);
      setQr(data.qrCodeUrl);
      setTwoFactorSecret(data.twoFactorSecret);
    };

    submit();
  };

  const handleRegister: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const submit = async () => {
      const data = await register(email, password, otp, twoFactorSectet);
      if (data.token) {
        setSession(data.token);
        navigate("/");
      }
    };

    submit();
  };
  return (
    <div>
      <h2>Register</h2>
      <form method="post" onSubmit={handleGenerateSecret}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={email}
          disabled={secretGenerated}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          disabled={secretGenerated}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <br />
        {!secretGenerated && <button type="submit">Generate QR code</button>}
      </form>
      <br />
      {secretGenerated && (
        <form method="post" onSubmit={handleRegister}>
          <img src={qr} />
          <br />
          <br />
          <input
            type="text"
            name="otp"
            placeholder="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.currentTarget.value)}
          />
          <br />
          <button type="submit">Register </button>
        </form>
      )}
      <Link to="/login">Already have an account?</Link>
    </div>
  );
}
