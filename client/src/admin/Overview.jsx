import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead, Card, Stat } from "./ui";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/stats")
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.response?.data?.message || "Failed to load stats"));
  }, []);

  if (error) return <div className="text-red-300">{error}</div>;
  if (!stats) return <div className="text-bone/45">Loading…</div>;

  const max = Math.max(1, ...stats.series.map((s) => s.count));

  return (
    <div>
      <PageHead title="Overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total views" value={stats.totalVisits} accent="#7866FF" />
        <Stat label="Views today" value={stats.todayVisits} accent="#5BE9B9" />
        <Stat label="Messages" value={stats.totalMessages} accent="#FF8A3D" />
        <Stat label="New messages" value={stats.newMessages} accent="#38D6FF" />
      </div>

      <Card className="p-6">
        <div className="text-bone/45 text-xs uppercase tracking-[0.18em] mb-5">
          Views — last 7 days
        </div>
        <div className="flex items-end gap-3 h-44">
          {stats.series.map((s) => (
            <div key={s.day} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-violet/70 transition-all"
                style={{ height: `${(s.count / max) * 100}%`, minHeight: 2 }}
                title={`${s.count} views`}
              />
              <span className="text-[10px] text-bone/35">
                {s.day.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Stat label="Projects" value={stats.totalProjects} accent="#7866FF" />
        <Stat
          label="Skill groups"
          value={stats.totalSkillGroups}
          accent="#5BE9B9"
        />
      </div>
    </div>
  );
}
