import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Btn, Input, Textarea, Field, ImageUpload } from "./ui";

const EMPTY = {
  t: "",
  category: "web",
  cat: "",
  year: "",
  blurb: "",
  desc: "",
  stack: "",
  liveUrl: "",
  sourceUrl: "",
  c1: "#7866FF",
  c2: "#2A1C9E",
  order: 0,
  published: true,
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // project object or null
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get("/projects/all"),
      api.get("/categories"),
    ]);
    setProjects(p.data);
    setCategories(c.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => setEditing({ ...EMPTY, stack: "" });
  const startEdit = (p) =>
    setEditing({ ...p, stack: (p.stack || []).join(", ") });

  const save = async () => {
    const payload = {
      ...editing,
      stack: editing.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      order: Number(editing.order) || 0,
    };
    if (editing._id) {
      await api.put(`/projects/${editing._id}`, payload);
    } else {
      await api.post("/projects", payload);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  // Image upload targets a saved project, so persist a new project first.
  const ensureSaved = async () => {
    if (editing._id) return editing._id;
    const payload = {
      ...editing,
      stack: editing.stack.split(",").map((s) => s.trim()).filter(Boolean),
      order: Number(editing.order) || 0,
    };
    const { data } = await api.post("/projects", payload);
    setEditing({ ...data, stack: (data.stack || []).join(", ") });
    return data._id;
  };

  const uploadImage = async (file) => {
    const id = await ensureSaved();
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post(`/projects/${id}/image`, fd);
    setEditing((e) => ({ ...e, _id: id, image: data.image }));
    load();
  };

  const removeImage = async () => {
    if (!editing._id) return;
    const { data } = await api.delete(`/projects/${editing._id}/image`);
    setEditing((e) => ({ ...e, image: data.image }));
    load();
  };

  if (loading) return <div className="text-bone/45">Loading…</div>;

  return (
    <div>
      <PageHead
        title={`Projects (${projects.length})`}
        action={<Btn onClick={startNew}>+ New project</Btn>}
      />

      {editing && (
        <Card className="p-6 mb-6">
          <div className="font-display font-bold mb-4">
            {editing._id ? "Edit project" : "New project"}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title">
              <Input
                value={editing.t}
                onChange={(e) => setEditing({ ...editing, t: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
                className="w-full bg-white/5 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-violet text-bone"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key} className="bg-[#08080B]">
                    {c.label} ({c.key})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subtitle (cat)">
              <Input
                value={editing.cat}
                onChange={(e) => setEditing({ ...editing, cat: e.target.value })}
              />
            </Field>
            <Field label="Year">
              <Input
                value={editing.year}
                onChange={(e) =>
                  setEditing({ ...editing, year: e.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Blurb (short)">
                <Input
                  value={editing.blurb}
                  onChange={(e) =>
                    setEditing({ ...editing, blurb: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description (long)">
                <Textarea
                  rows={4}
                  value={editing.desc}
                  onChange={(e) =>
                    setEditing({ ...editing, desc: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Stack (comma separated)">
                <Input
                  value={editing.stack}
                  onChange={(e) =>
                    setEditing({ ...editing, stack: e.target.value })
                  }
                  placeholder="React, Node, MongoDB"
                />
              </Field>
            </div>
            <Field label="Live URL">
              <Input
                value={editing.liveUrl}
                onChange={(e) =>
                  setEditing({ ...editing, liveUrl: e.target.value })
                }
                placeholder="https://myproject.com"
              />
            </Field>
            <Field label="Source code URL">
              <Input
                value={editing.sourceUrl}
                onChange={(e) =>
                  setEditing({ ...editing, sourceUrl: e.target.value })
                }
                placeholder="https://github.com/you/repo"
              />
            </Field>
            <Field label="Color 1">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={editing.c1}
                  onChange={(e) =>
                    setEditing({ ...editing, c1: e.target.value })
                  }
                  className="h-9 w-12 rounded bg-transparent border border-line"
                />
                <Input
                  value={editing.c1}
                  onChange={(e) =>
                    setEditing({ ...editing, c1: e.target.value })
                  }
                />
              </div>
            </Field>
            <Field label="Color 2">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={editing.c2}
                  onChange={(e) =>
                    setEditing({ ...editing, c2: e.target.value })
                  }
                  className="h-9 w-12 rounded bg-transparent border border-line"
                />
                <Input
                  value={editing.c2}
                  onChange={(e) =>
                    setEditing({ ...editing, c2: e.target.value })
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
            <label className="flex items-center gap-2 text-sm text-bone/70 self-end">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
                className="accent-violet"
              />
              Published
            </label>
          </div>

          <div className="mt-5">
            <ImageUpload
              label="Project image"
              value={editing.image}
              onUpload={uploadImage}
              onRemove={removeImage}
            />
            <p className="text-xs text-bone/35 mt-2">
              Shown on the Work card, tinted with the project colors. Uploading
              saves the project first if it's new.
            </p>
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
        {projects.map((p) => (
          <Card key={p._id} className="overflow-hidden">
            <div
              className="h-24 bg-cover bg-center"
              style={{
                backgroundImage: p.image?.url
                  ? `linear-gradient(120deg, ${p.c1}66, ${p.c2}66), url(${p.image.url})`
                  : `radial-gradient(120% 120% at 75% 12%, ${p.c1}, ${p.c2})`,
              }}
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">{p.t}</span>
                {!p.published && (
                  <span className="text-[10px] text-bone/40 uppercase">
                    draft
                  </span>
                )}
              </div>
              <div className="text-xs text-bone/45 mt-1">
                {p.category} · {p.year}
              </div>
              <div className="mt-4 flex gap-2">
                <Btn variant="ghost" onClick={() => startEdit(p)}>
                  Edit
                </Btn>
                <Btn variant="danger" onClick={() => remove(p._id)}>
                  Delete
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
