import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import App, { loader as appLoader } from "./pages/App";
import Register, { loader as registerLoader } from "./pages/Register";
import Login, { loader as loginLoader } from "./pages/Login";
import { deletePassword, storePassword } from "./api";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: appLoader,
  },
  {
    path: "/register",
    element: <Register />,
    loader: registerLoader,
  },
  {
    path: "/login",
    element: <Login />,
    loader: loginLoader,
  },
  {
    path: "/delete-password",
    action: async ({ request }) => {
      const fd = await request.formData();
      const id = fd.get("id") as string;
      await deletePassword(id);
      return redirect("/");
    },
  },
  {
    path: "/store-password",
    action: async ({ request }) => {
      const fd = await request.formData();
      const hostname = fd.get("hostname") as string;
      const username = fd.get("username") as string;
      const password = fd.get("password") as string;
      const secret = fd.get("secret") as string;
      await storePassword(hostname, username, password, secret);
      return redirect("/");
    },
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
