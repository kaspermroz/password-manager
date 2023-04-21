import { redirect, useNavigate } from "react-router-dom";
import { destroySession } from "../utils/session";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return redirect("/login");
  }

  return null;
}

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    destroySession();
    navigate("/login");
  };

  return (
    <div>
      <pre>{localStorage.getItem("userToken")}</pre>
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
