import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken, clearToken } from "../lib/api";
import Cursor from "../components/Cursor";

const LINKS = [
  ["/admin", "Overview", true],
  ["/admin/messages", "Messages"],
  ["/admin/projects", "Projects"],
  ["/admin/skills", "Skills"],
  ["/admin/categories", "Categories"],
  ["/admin/users", "Users"],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  let usertype = "admin";
  try {
    usertype = jwtDecode(getToken())?.usertype || "admin";
  } catch {
    /* noop */
  }

  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-bone font-body flex">
      <Cursor />
      {/* sidebar */}
      <aside className="w-60 shrink-0 border-r border-line p-5 flex flex-col gap-1 sticky top-0 h-screen">
        <div className="mb-6">
          <div className="font-display font-extrabold text-xl tracking-tight">
            Dashboard
          </div>
          <div className="text-bone/40 text-xs mt-1 capitalize">{usertype}</div>
        </div>

        {LINKS.filter(([path]) =>
          path === "/admin/users" ? usertype === "superadmin" : true
        ).map(([path, label, end]) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-violet/15 text-bone border border-violet/30"
                  : "text-bone/55 hover:text-bone hover:bg-white/5 border border-transparent"
              }`
            }
          >
            {label}
          </NavLink>
        ))}

        <div className="mt-auto flex flex-col gap-2">
          <a
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-bone/55 hover:text-bone hover:bg-white/5"
          >
            ← View site
          </a>
          <button
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm text-left text-red-300/80 hover:text-red-300 hover:bg-red-500/10"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* content */}
      <main className="flex-1 p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
