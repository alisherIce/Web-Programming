const { useEffect, useMemo, useState } = React;

const projects = [
  { id: "archive", mark: "01", title: "Course Archive", description: "A growing record of weekly web programming work, from semantic HTML through React forms.", tech: ["HTML", "CSS", "JavaScript", "React"], href: "../index.html", label: "Explore the archive" },
  { id: "book-search", mark: "02", title: "Book Finder", description: "Search the Open Library API and turn live book data into useful, readable results.", tech: ["JavaScript", "Fetch API", "Accessibility"], href: "../Week%207/book-search.html", label: "Open Week 7 project" },
  { id: "react-props", mark: "03", title: "Component Gallery", description: "Reusable React cards, props, children, stable list keys, and filtered project data.", tech: ["React", "Components", "Props"], href: "../Week%2011/Week-11-01-React-Components-Props.html", label: "Open Week 11 work" },
  { id: "cart", mark: "04", title: "Interactive Cart", description: "Product quantities and computed totals with immutable state updates and local persistence.", tech: ["React", "State", "localStorage"], href: "../Week%2012/Week-12-01-useState.html", label: "Open Week 12.01" },
  { id: "weather", mark: "05", title: "Weather Dashboard", description: "City geocoding, current weather, clear request states, and cancelled stale fetches.", tech: ["React", "Effects", "API"], href: "../Week%2012/Week-12-02-useEffect.html", label: "Open Week 12.02" },
  { id: "forms", mark: "06", title: "React Registration", description: "A guided form flow with controlled inputs, accessible validation, and a profile preview.", tech: ["React", "Forms", "Validation"], href: "../Week%2013/index.html", label: "Open Week 13 work" },
  { id: "findit-ai", mark: "AI", title: "FindIt AI", description: "A smart lost-and-found app that matches item photos and helps people reconnect with what they misplaced.", tech: ["React", "TypeScript", "Python", "AI"], href: "https://alisherice.github.io/FindIt-AI/", label: "Open FindIt AI demo" },
];
const lessons = [
  { week: "01–02", title: "HTML foundations", detail: "Semantic structure, links, figures, lists, and citations." },
  { week: "03–04", title: "CSS + interaction", detail: "Responsive layout, Flexbox, the DOM, and event-driven UI." },
  { week: "05–07", title: "JavaScript + APIs", detail: "Functions, arrays, localStorage, fetch, async/await, and errors." },
  { week: "08–09", title: "Forms + access", detail: "Native validation, keyboard access, contrast, and Lighthouse." },
  { week: "10", title: "Git + deployment", detail: "Small commits, GitHub collaboration, and static Pages hosting." },
  { week: "11", title: "React components", detail: "JSX, props, composition, keys, and conditional rendering." },
  { week: "12", title: "State + effects", detail: "Immutable state, effect cleanup, API requests, and persistence." },
  { week: "13", title: "React forms", detail: "Controlled inputs, validation, previews, and multi-step flow." },
];
const weatherDescriptions = { 0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 95: "Thunderstorm" };

function ThemeButton({ theme, onToggle }) {
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? "◐ Dark mode" : "☼ Light mode"}</button>;
}
function Header({ theme, onToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header"><nav className="nav" aria-label="Main navigation"><a className="wordmark" href="#top">AU <span>/</span> WEB PROGRAMMING</a><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-links" onClick={() => setMenuOpen(v => !v)}>Menu</button><div className={`nav-links${menuOpen ? " open" : ""}`} id="site-links">{[["About", "#about"], ["Projects", "#projects"], ["Lessons", "#lessons"], ["Field notes", "#notes"]].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<ThemeButton theme={theme} onToggle={onToggle}/></div></nav></header>;
}
function WeatherCard() {
  const [query, setQuery] = useState("Tashkent");
  const [city, setCity] = useState("Tashkent");
  const [weather, setWeather] = useState({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setWeather({ status: "loading" });
      try {
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geoUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
        const geoResponse = await fetch(geoUrl, { signal: controller.signal });
        if (!geoResponse.ok) throw new Error("City search is unavailable. Try again shortly.");
        const geo = await geoResponse.json();
        const place = geo.results?.[0];
        if (!place) throw new Error(`No match for “${city}”. Check the spelling and try again.`);
        const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
        weatherUrl.search = new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude), current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code", timezone: "auto" });
        const response = await fetch(weatherUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Weather could not be loaded. Please try again.");
        const data = await response.json();
        setWeather({ status: "ready", place, current: data.current, units: data.current_units });
      } catch (error) {
        if (error.name !== "AbortError") setWeather({ status: "error", message: error instanceof TypeError ? "Please check your internet connection." : error.message });
      }
    };
    load();
    return () => controller.abort();
  }, [city]);
  function submit(event) { event.preventDefault(); const next = query.trim(); if (next) setCity(next); }
  return <section className="weather-card" aria-labelledby="weather-title"><div className="weather-top"><div><div className="mono">LIVE · OPEN-METEO</div><h3 id="weather-title">Weather check-in</h3></div><span aria-hidden="true">☀</span></div><form className="weather-form" role="search" onSubmit={submit}><label className="sr-only" htmlFor="weather-city">Search city weather</label><input className="field" id="weather-city" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" placeholder="City name"/><button className="small-button" type="submit" disabled={!query.trim()}>Search</button></form>{weather.status === "loading" && <p className="message loading" role="status">Finding live conditions for {city}…</p>}{weather.status === "error" && <p className="message error" role="alert">{weather.message}</p>}{weather.status === "ready" && <div className="weather-reading"><div><div className="weather-place">{weather.place.name}{weather.place.country ? `, ${weather.place.country}` : ""}</div><div className="weather-desc">{weatherDescriptions[weather.current.weather_code] || "Current conditions"}</div></div><div className="temperature">{Math.round(weather.current.temperature_2m)}°</div></div>}{weather.status === "ready" && <div className="weather-details"><div><span>Feels like</span><strong>{Math.round(weather.current.apparent_temperature)}{weather.units.apparent_temperature}</strong></div><div><span>Humidity</span><strong>{weather.current.relative_humidity_2m}{weather.units.relative_humidity_2m}</strong></div><div><span>Wind</span><strong>{Math.round(weather.current.wind_speed_10m)} {weather.units.wind_speed_10m}</strong></div></div>}<p className="message">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>. Search requires an internet connection.</p></section>;
}
function ProjectCard({ project }) {
  return <article className="project-card"><div className="project-meta"><span className="project-mark" aria-hidden="true">{project.mark}</span><span className="mono">PROJECT · {project.id.toUpperCase()}</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="tags">{project.tech.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><a className="project-link" href={project.href}>{project.label} ↗</a></article>;
}
function ProjectGallery() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filters = ["All", "HTML", "CSS", "JavaScript", "React", "API", "Forms"];
  const visible = useMemo(() => projects.filter(project => {
    const matchesFilter = filter === "All" || project.tech.some(tag => tag.toLowerCase() === filter.toLowerCase());
    const text = `${project.title} ${project.description} ${project.tech.join(" ")}`.toLowerCase();
    return matchesFilter && text.includes(query.trim().toLowerCase());
  }), [filter, query]);
  return <><div className="toolbar"><div className="filters" aria-label="Filter projects by technology">{filters.map(item => <button className="filter" type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="sr-only" htmlFor="project-search">Search projects</label><input className="field search" id="project-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the work…"/></div><div className="project-grid" aria-live="polite">{visible.length ? visible.map(project => <ProjectCard key={project.id} project={project}/>) : <p className="empty-state">No projects match that search. Try a different topic.</p>}</div></>;
}
function FieldNotes() {
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem("alisher-capstone-notes") || "[]"); } catch { return []; } });
  const [text, setText] = useState("");
  useEffect(() => { localStorage.setItem("alisher-capstone-notes", JSON.stringify(notes)); }, [notes]);
  function addNote(event) { event.preventDefault(); const value = text.trim(); if (!value) return; setNotes(current => [{ id: crypto.randomUUID(), text: value, createdAt: new Date().toISOString() }, ...current].slice(0, 12)); setText(""); }
  function removeNote(id) { setNotes(current => current.filter(note => note.id !== id)); }
  return <div className="notes-layout"><section className="notes-card"><div className="mono">A SMALL REACT FORM</div><h3>Save a learning note</h3><p className="section-intro">Write one idea to revisit. Notes stay in this browser using localStorage.</p><form className="note-form" onSubmit={addNote}><label htmlFor="note-text">Your note</label><textarea className="field" id="note-text" value={text} onChange={e => setText(e.target.value)} maxLength="240" required placeholder="Example: effect cleanup aborts an older fetch…"></textarea><div className="mono" aria-live="polite">{text.length} / 240</div><button className="button primary" type="submit">Save note</button></form></section><section className="notes-card" aria-labelledby="saved-notes-heading"><div className="mono">SAVED ON THIS DEVICE</div><h3 id="saved-notes-heading">Field notes <span className="mono">({notes.length})</span></h3>{notes.length ? <ul className="note-list" style={{listStyle:"none",padding:0,margin:0}}>{notes.map(note => <li className="note-item" key={note.id}><div><p>{note.text}</p><time dateTime={note.createdAt}>{new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(note.createdAt))}</time></div><button className="delete-note" type="button" onClick={() => removeNote(note.id)} aria-label={`Delete note: ${note.text.slice(0,45)}`}>Delete</button></li>)}</ul> : <p className="note-empty">No notes yet. Save a useful idea from this semester.</p>}</section></div>;
}
function LessonMap() { return <div className="lesson-grid">{lessons.map(item => <article className="lesson-card" key={item.week}><span className="week">WEEK {item.week}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div>; }
function App() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("alisher-capstone-theme") === "dark" ? "dark" : "light"; } catch { return "light"; } });
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem("alisher-capstone-theme", theme); }, [theme]);
  return <><Header theme={theme} onToggle={() => setTheme(current => current === "light" ? "dark" : "light")}/><main id="main"><section className="wrap hero" id="top"><div><div className="kicker">GACHON UNIVERSITY · WEB PROGRAMMING · 2026</div><h1>Learning by<br/><em>making things.</em></h1><p className="hero-copy">I’m Alisher Ulmasov, a Computer Science student from Uzbekistan. This capstone connects the ideas I practiced across the course: accessible HTML, responsive CSS, JavaScript, APIs, and React.</p><div className="hero-actions"><a className="button primary" href="#projects">Explore the work ↓</a><a className="button secondary" href="../index.html">Open full course archive ↗</a></div></div><figure className="hero-photo"><img className="portrait" src="alisher-ulmasov.jpg" alt="Portrait of Alisher Ulmasov"/><figcaption className="photo-caption"><span className="mono">GACHON UNIVERSITY · COMPUTER SCIENCE</span><strong>Alisher Ulmasov</strong><div className="hero-student-id"><span>STUDENT ID</span><b>2025370098</b></div></figcaption></figure></section><section className="section wrap" id="about"><div className="section-head"><div><div className="section-label">01 / A LITTLE ABOUT ME</div><h2>Curiosity into code.</h2></div></div><div className="about-grid"><article className="about-card"><div className="mono">ALISHER ULMASOV · COMPUTER SCIENCE</div><h3>From Uzbekistan to Gachon University.</h3><p>I’m learning to make web experiences that are clear, useful, and welcoming. This archive follows my progress from the first HTML pages to React interfaces that work with real data and real user input.</p><div className="facts"><div className="fact"><strong>13</strong><span>course weeks collected</span></div><div className="fact"><strong>4</strong><span>core course themes</span></div></div></article><WeatherCard/></div></section><section className="section wrap" id="projects"><div className="section-head"><div><div className="section-label">02 / SELECTED COURSEWORK</div><h2>Small projects, real skills.</h2></div></div><p className="section-intro">Each project links back to its lesson page in the archive. Filter by a course topic or search for a skill.</p><ProjectGallery/></section><section className="section wrap" id="lessons"><div className="section-head"><div><div className="section-label">03 / THE LEARNING PATH</div><h2>One semester, connected.</h2></div></div><p className="section-intro">The later React projects build on the foundations from earlier weeks: structure, layout, JavaScript, APIs, accessibility, and deployment.</p><LessonMap/></section><section className="section wrap" id="notes"><div className="section-head"><div><div className="section-label">04 / KEEP LEARNING</div><h2>Save a useful idea.</h2></div></div><FieldNotes/></section><section className="wrap"><div className="final-strip"><div><div className="mono">THE NEXT STEP</div><h2>Keep building from here.</h2><p>Browse the weekly exercises, quiz study notes, and assignments in the course archive.</p></div><a className="button primary" href="../index.html">Visit the course archive ↗</a></div></section></main><footer className="footer"><div className="wrap footer-inner"><div><strong>Alisher Ulmasov</strong><br/><small>Computer Science · Gachon University · 2026</small></div><div className="footer-links"><a href="../index.html">Course archive</a><a href="../Week%2012/Week-12-Quizzes-and-Final-Project.html">Week 12 study notes</a><a href="mailto:email.2025370098@gachon.ac.kr">Email</a></div></div></footer></>;
}
ReactDOM.createRoot(document.getElementById("app")).render(<App/>);
