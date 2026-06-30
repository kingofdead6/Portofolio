import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import { DataProvider } from "./lib/DataContext.jsx";

import Login from "./admin/Login.jsx";
import ProtectedRoute from "./admin/ProtectedRoute.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Overview from "./admin/Overview.jsx";
import Messages from "./admin/Messages.jsx";
import Projects from "./admin/Projects.jsx";
import Skills from "./admin/Skills.jsx";
import Categories from "./admin/Categories.jsx";
import Users from "./admin/Users.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The public portfolio fetches its content from the API, so it lives
            under the DataProvider. Admin views pull their own data per-page. */}
        <Route
          path="/"
          element={
            <DataProvider>
              <App />
            </DataProvider>
          }
        />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="messages" element={<Messages />} />
            <Route path="projects" element={<Projects />} />
            <Route path="skills" element={<Skills />} />
            <Route path="categories" element={<Categories />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
