import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Btn, Input, Field } from "./ui";

const EMPTY_GROUP = { group: "", label: "", accent: "#7866FF", items: [], order: 0 };
const EMPTY_ITEM = { n: "", i: "", level: 80, note: "" };

export default function Skills() {
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/skills").then((r) => {
      setGroups(r.data);
      setLoading(false);
    });

  useEffect(() => {
    load();
  }, []);

  const startNew = () => setEditing({ ...EMPTY_GROUP, items: [] });
  const startEdit = (g) =>
    setEditing({ ...g, items: g.items.map((it) => ({ ...it })) });

  const save = async () => {
    const payload = {
      ...editing,
      order: Number(editing.order) || 0,
      items: editing.items.map((it) => ({
        ...it,
        i: it.i || null,
        level: Number(it.level) || 0,
      })),
    };
    if (editing._id) await api.put(`/skills/${editing._id}`, payload);
    else await api.post("/skills", payload);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this skill group?")) return;
    await api.delete(`/skills/${id}`);
    load();
  };

  const updateItem = (idx, patch) =>
    setEditing({
      ...editing,
      items: editing.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    });

  const addItem = () =>
    setEditing({ ...editing, items: [...editing.items, { ...EMPTY_ITEM }] });

  const removeItem = (idx) =>
    setEditing({
      ...editing,
      items: editing.items.filter((_, i) => i !== idx),
    });

  // Skill items are embedded, so we upload the icon to the generic /upload
  // endpoint and store the returned { url, public_id } on the item. The group
  // save then persists it.
  const uploadItemImage = async (idx, file) => {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post("/upload", fd);
    updateItem(idx, { image: data });
  };

  if (loading) return <div className="text-bone/45">Loading…</div>;

  return (
    <div>
      <PageHead
        title={`Skills (${groups.length})`}
        action={<Btn onClick={startNew}>+ New group</Btn>}
      />

      {editing && (
        <Card className="p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Group name">
              <Input
                value={editing.group}
                onChange={(e) =>
                  setEditing({ ...editing, group: e.target.value })
                }
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
          </div>

          <div className="mt-5 mb-2 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.16em] text-bone/45">
              Items
            </span>
            <Btn variant="ghost" onClick={addItem}>
              + Item
            </Btn>
          </div>

          <div className="space-y-2">
            {editing.items.map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center"
              >
                {/* image / icon preview + upload */}
                <label className="col-span-1 cursor-pointer">
                  <div className="h-9 w-9 rounded-md border border-line bg-white/5 overflow-hidden grid place-items-center hover:border-violet">
                    {it.image?.url ? (
                      <img
                        src={it.image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : it.i ? (
                      <img
                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${it.i}.svg`}
                        alt=""
                        className="h-5 w-5 object-contain opacity-70"
                      />
                    ) : (
                      <span className="text-bone/30 text-[9px]">img</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadItemImage(idx, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <Input
                  className="col-span-2"
                  placeholder="Name"
                  value={it.n}
                  onChange={(e) => updateItem(idx, { n: e.target.value })}
                />
                <Input
                  className="col-span-4"
                  placeholder="devicon path (fallback if no image)"
                  value={it.i || ""}
                  onChange={(e) => updateItem(idx, { i: e.target.value })}
                />
                <Input
                  className="col-span-1"
                  type="number"
                  placeholder="lvl"
                  value={it.level}
                  onChange={(e) => updateItem(idx, { level: e.target.value })}
                />
                <Input
                  className="col-span-3"
                  placeholder="note"
                  value={it.note}
                  onChange={(e) => updateItem(idx, { note: e.target.value })}
                />
                <button
                  onClick={() => removeItem(idx)}
                  className="col-span-1 text-red-300/70 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <Card key={g._id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: g.accent }}
                />
                <span className="font-display font-bold">{g.group}</span>
                <span className="text-sm text-bone/40">{g.label}</span>
                <span className="text-xs text-bone/30">
                  ({g.items.length})
                </span>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => startEdit(g)}>
                  Edit
                </Btn>
                <Btn variant="danger" onClick={() => remove(g._id)}>
                  Delete
                </Btn>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.map((it) => (
                <span
                  key={it.n}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 border border-line text-bone/70"
                >
                  {it.n} · {it.level}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
