import { useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { login } from "../api";
import { setSession } from "../utils/session";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    return redirect("/");
  }

  return null;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleLogin: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const submit = async () => {
      const data = await login(email, password, otp);
      if (data.token) {
        setSession(data.token);
      }
      navigate("/");
    };

    submit();
  };

  return (
    <div>
      <h2>Login</h2>
      <form method="post" onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <br />
        <input
          type="otp"
          name="otp"
          placeholder="OTP Code"
          value={otp}
          onChange={(e) => setOtp(e.currentTarget.value)}
        />
        <br />
        <button type="submit">Login </button>
        <br />
      </form>
      <br />
      <Link to="/register">Don&apos;t have an account?</Link>
    </div>
  );
}
