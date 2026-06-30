import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Btn, Input, Field } from "./ui";

const EMPTY = { name: "", email: "", password: "", usertype: "admin" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/auth/users")
      .then((r) => {
        setUsers(r.data);
        setLoading(false);
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Failed to load users")
      );

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError("");
    try {
      await api.post("/auth/register", creating);
      setCreating(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create user");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="text-bone/45">Loading…</div>;

  return (
    <div>
      <PageHead
        title={`Users (${users.length})`}
        action={<Btn onClick={() => setCreating({ ...EMPTY })}>+ New user</Btn>}
      />

      {error && <div className="text-red-300 mb-4">{error}</div>}

      {creating && (
        <Card className="p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name">
              <Input
                value={creating.name}
                onChange={(e) =>
                  setCreating({ ...creating, name: e.target.value })
                }
              />
            </Field>
            <Field label="Email">
              <Input
                value={creating.email}
                onChange={(e) =>
                  setCreating({ ...creating, email: e.target.value })
                }
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={creating.password}
                onChange={(e) =>
                  setCreating({ ...creating, password: e.target.value })
                }
              />
            </Field>
            <Field label="Role">
              <select
                value={creating.usertype}
                onChange={(e) =>
                  setCreating({ ...creating, usertype: e.target.value })
                }
                className="w-full bg-white/5 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-violet text-bone"
              >
                <option value="admin" className="bg-[#08080B]">
                  admin
                </option>
                <option value="superadmin" className="bg-[#08080B]">
                  superadmin
                </option>
                <option value="user" className="bg-[#08080B]">
                  user
                </option>
              </select>
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <Btn onClick={create}>Create</Btn>
            <Btn variant="ghost" onClick={() => setCreating(null)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u._id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold">
                {u.name || "—"}{" "}
                <span className="text-xs text-bone/40 font-body">
                  {u.usertype}
                </span>
              </div>
              <div className="text-sm text-bone/50">{u.email}</div>
            </div>
            {u.usertype !== "superadmin" && (
              <Btn variant="danger" onClick={() => remove(u._id)}>
                Delete
              </Btn>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
