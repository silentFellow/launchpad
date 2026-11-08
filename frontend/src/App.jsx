import { useEffect, useState } from 'react';

const api = async (path, options = {}) => {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.status === 204 ? null : res.json();
};

const TIERS = [
  { key: 'web', label: 'React', sub: 'nginx' },
  { key: 'api', label: 'Express', sub: 'node' },
  { key: 'db', label: 'Postgres', sub: 'volume' },
];

export default function App() {
  const [missions, setMissions] = useState([]);
  const [health, setHealth] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const run = (fn) => fn().catch((e) => setError(e.message));
  const load = () => run(async () => setMissions(await api('/missions')));

  useEffect(() => {
    load();
    run(async () => setHealth(await api('/health')));
  }, []);

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await api('/missions', { method: 'POST', body: JSON.stringify({ title }) });
      setTitle('');
      setError('');
      load();
    });
  };
  const toggle = (id) => run(async () => { await api(`/missions/${id}`, { method: 'PATCH' }); load(); });
  const remove = (id) => run(async () => { await api(`/missions/${id}`, { method: 'DELETE' }); load(); });

  const done = missions.filter((m) => m.done).length;
  const pct = missions.length ? Math.round((done / missions.length) * 100) : 0;

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">three-tier · docker compose</p>
        <h1>Launch<span>pad</span></h1>
        <p className="tagline">Mission control for your next deploy.</p>
      </header>

      <section className="stack" aria-label="Stack status">
        {TIERS.map((t, i) => (
          <div key={t.key} className="tier-wrap">
            <div className={`tier ${health ? 'live' : ''}`}>
              <span className="dot" aria-hidden="true" />
              <strong>{t.label}</strong>
              <small>{t.sub}</small>
            </div>
            {i < TIERS.length - 1 && <span className={`link ${health ? 'live' : ''}`} aria-hidden="true" />}
          </div>
        ))}
      </section>
      <p className="status" role="status">
        {health ? `All systems go · ${health.db}` : 'Connecting to the stack…'}
      </p>

      <section className="card">
        <div className="progress">
          <div className="ring" style={{ '--pct': pct }}>
            <span>{pct}%</span>
          </div>
          <div>
            <h2>Missions</h2>
            <p>{done} of {missions.length} complete</p>
          </div>
        </div>

        <form onSubmit={add} className="add">
          <label htmlFor="title" className="sr-only">New mission</label>
          <input
            id="title"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Queue a new mission…"
          />
          <button disabled={!title.trim()}>Launch</button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}

        <ul className="list">
          {missions.map((m) => (
            <li key={m.id} className={m.done ? 'done' : ''}>
              <button className="check" onClick={() => toggle(m.id)} aria-label={`Mark "${m.title}" ${m.done ? 'not done' : 'done'}`}>
                {m.done ? '✓' : ''}
              </button>
              <span className="title">{m.title}</span>
              <button className="remove" onClick={() => remove(m.id)} aria-label={`Delete "${m.title}"`}>×</button>
            </li>
          ))}
          {!missions.length && <li className="empty">No missions yet. Launch one above.</li>}
        </ul>
      </section>
    </main>
  );
}
