import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

// The dynamic content (projects / skills / categories) now comes from the API.
// The static bits (NAV order, contact details, socials, the devicon helper)
// were never DB-backed, so we re-export them unchanged from data.js to keep the
// design's values identical and avoid drift.
export { NAV, SOCIALS, EMAIL, CV_URL, icon } from "./data";

const DataContext = createContext({
  projects: [],
  skills: [],
  categories: [],
  loading: true,
  error: null,
});

export function DataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    // Record a page view (fire-and-forget; never blocks rendering).
    api
      .post("/stats/visit", { path: window.location.pathname, referrer: document.referrer })
      .catch(() => {});

    (async () => {
      try {
        const [p, s, c] = await Promise.all([
          api.get("/projects"),
          api.get("/skills"),
          api.get("/categories"),
        ]);
        if (!alive) return;
        setProjects(p.data || []);
        setSkills(s.data || []);
        setCategories(c.data || []);
      } catch (err) {
        if (!alive) return;
        setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DataContext.Provider
      value={{ projects, skills, categories, loading, error }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
