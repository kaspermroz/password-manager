import { redirect } from "react-router-dom";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return redirect("/login");
  }
}

function App() {
  return <div>hi there</div>;
}

export default App;
