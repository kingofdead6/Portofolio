import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Btn } from "./ui";

const STATUS_COLORS = {
  new: "#5BE9B9",
  read: "#7866FF",
  replied: "#38D6FF",
  archived: "#888",
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/contact").then((r) => {
      setMessages(r.data);
      setLoading(false);
    });

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    await api.put(`/contact/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this message?")) return;
    await api.delete(`/contact/${id}`);
    load();
  };

  if (loading) return <div className="text-bone/45">Loading…</div>;

  return (
    <div>
      <PageHead title={`Messages (${messages.length})`} />
      {messages.length === 0 && (
        <div className="text-bone/40">No messages yet.</div>
      )}
      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m._id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold">{m.name}</span>
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: STATUS_COLORS[m.status],
                      background: `${STATUS_COLORS[m.status]}22`,
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="text-sm text-bone/55 hover:text-violet"
                >
                  {m.email}
                </a>
              </div>
              <span className="text-xs text-bone/35 whitespace-nowrap">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-bone/80 text-sm whitespace-pre-wrap">
              {m.message}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["new", "read", "replied", "archived"].map((s) => (
                <Btn
                  key={s}
                  variant="ghost"
                  className={m.status === s ? "border-violet/40 text-bone" : ""}
                  onClick={() => setStatus(m._id, s)}
                >
                  {s}
                </Btn>
              ))}
              <Btn variant="danger" onClick={() => remove(m._id)}>
                Delete
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
