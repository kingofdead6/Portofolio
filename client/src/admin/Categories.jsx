import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Btn, Input, Field } from "./ui";

const EMPTY = { key: "", label: "", sub: "", accent: "#7866FF", order: 0 };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/categories").then((r) => {
      setCategories(r.data);
      setLoading(false);
    });

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = { ...editing, order: Number(editing.order) || 0 };
    if (editing._id) await api.put(`/categories/${editing._id}`, payload);
    else await api.post("/categories", payload);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  if (loading) return <div className="text-bone/45">Loading…</div>;

  return (
    <div>
      <PageHead
        title={`Categories (${categories.length})`}
        action={<Btn onClick={() => setEditing({ ...EMPTY })}>+ New</Btn>}
      />

      {editing && (
        <Card className="p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Key (slug)">
              <Input
                value={editing.key}
                onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                placeholder="web"
              />
            </Field>
            <Field label="Label">
              <Input
                value={editing.label}
                onChange={(e) =>
                  setEditing({ ...editing, label: e.target.value })
                }
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={editing.sub}
                onChange={(e) => setEditing({ ...editing, sub: e.target.value })}
              />
            </Field>
            <Field label="Accent">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={editing.accent}
                  onChange={(e) =>
                    setEditing({ ...editing, accent: e.target.value })
                  }
                  className="h-9 w-12 rounded bg-transparent border border-line"
                />
                <Input
                  value={editing.accent}
                  onChange={(e) =>
                    setEditing({ ...editing, accent: e.target.value })
                  }
                />
              </div>
            </Field>
            <Field label="Order">
              <Input
                type="number"
                value={editing.order}
                onChange={(e) =>
                  setEditing({ ...editing, order: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c._id} className="p-5">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: c.accent }}
              />
              <span className="font-display font-bold">{c.label}</span>
              <span className="text-xs text-bone/35">{c.key}</span>
            </div>
            <div className="text-sm text-bone/45 mt-1">{c.sub}</div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" onClick={() => setEditing(c)}>
                Edit
              </Btn>
              <Btn variant="danger" onClick={() => remove(c._id)}>
                Delete
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
