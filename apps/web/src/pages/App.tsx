import { useState } from "react";
import { redirect, useNavigate, useLoaderData } from "react-router-dom";
import { destroySession } from "../utils/session";
import { getEncryptedPasswords, isTokenValid, storePassword } from "../api";

type StoredPasswords = {
  _id: string;
  hostname: string;
  username: string;
  encryptedPassword: string;
};

type LoaderData = {
  passwords: StoredPasswords[];
  userToken: string;
};

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return redirect("/login");
  }

  if (!(await isTokenValid(userToken))) {
    destroySession();
    return redirect("/login");
  }

  const passwords = await getEncryptedPasswords(userToken);

  return { passwords, userToken };
}

function App() {
  const [hostname, setHostname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const navigate = useNavigate();
  const { passwords, userToken } = useLoaderData() as LoaderData;

  const handleLogout = () => {
    destroySession();
    navigate("/login");
  };

  const addPassword = () => {
    storePassword(hostname, username, password, secret, userToken);
  };

  const deletePassword = (id: string) => {
    console.log("delete", id);
  };

  return (
    <div>
      <h1>Password Manager</h1>
      <div>
        <h2>Add new password</h2>
        <input
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          placeholder="Hostname"
        />
        <br />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <br />
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <br />
        <input
          value={secret}
          type="password"
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret"
        />
        <br />
        <button onClick={addPassword}>Add Password</button>
      </div>
      <div>
        <h2>Your Stored Passwords</h2>
        {passwords.map((password) => (
          <div key={password._id}>
            <h3>{password.hostname}</h3>
            <p>Username: {password.username}</p>
            <p>Encrypted Password: {password.encryptedPassword}</p>
            <button onClick={() => deletePassword(password._id)}>Delete</button>
          </div>
        ))}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
export default App;
