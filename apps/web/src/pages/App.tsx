import { redirect, useNavigate, useLoaderData, Form } from "react-router-dom";
import { destroySession } from "../utils/session";
import { getEncryptedPasswords, isTokenValid } from "../api";

type StoredPasswords = {
  _id: string;
  hostname: string;
  username: string;
  encryptedPassword: string;
};

type LoaderData = {
  passwords: StoredPasswords[];
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

  return { passwords };
}

function App() {
  const navigate = useNavigate();
  const { passwords } = useLoaderData() as LoaderData;

  const handleLogout = () => {
    destroySession();
    navigate("/login");
  };

  const deletePassword = (id: string) => {
    console.log("delete", id);
  };

  return (
    <div>
      <h1>Password Manager</h1>
      <div>
        <h2>Add new password</h2>
        <Form method="post" action="/store-password">
          <input name="hostname" placeholder="Hostname" />
          <br />
          <input name="username" placeholder="Username" />
          <br />
          <input name="password" type="password" placeholder="Password" />
          <br />
          <input name="secret" type="password" placeholder="Secret" />
          <br />
          <button type="submit">Add Password</button>
        </Form>
      </div>
      <div>
        <h2>Your Stored Passwords</h2>
        {passwords.map((password) => (
          <div key={password._id}>
            <h3>{password.hostname}</h3>
            <p>Username: {password.username}</p>
            <p>Encrypted Password: {password.encryptedPassword}</p>
            <Form method="post" action="/delete-password">
              <input type="hidden" name="id" value={password._id} />
              <button type="submit">Delete</button>
            </Form>
          </div>
        ))}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
export default App;
