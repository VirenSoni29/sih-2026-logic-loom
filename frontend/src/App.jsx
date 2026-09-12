import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity, BarChart3, Bell, BookOpen, ChevronRight, Leaf, LogIn,
  Map, MapPin, Menu, Search, ShieldCheck, Users, X
} from "lucide-react";

const initialForm = {
  location: "Chamoli, Uttarakhand",
  rainfall: 145,
  slope: 38,
  moisture: 78,
  vegetation: 42,
  ground: "Weathered"
};

const alerts = [
  { level: "High Risk Alert", place: "Chamoli, Uttarakhand", detail: "Heavy rainfall may trigger landslides.", time: "2 hours ago", tone: "high" },
  { level: "Moderate Risk", place: "Tehri, Uttarakhand", detail: "Increased soil moisture detected.", time: "5 hours ago", tone: "medium" },
  { level: "Caution", place: "Pauri, Uttarakhand", detail: "Be alert. Possible landslide activity.", time: "1 day ago", tone: "caution" },
  { level: "Normal", place: "Dehradun, Uttarakhand", detail: "No immediate risk detected.", time: "2 days ago", tone: "low" }
];

function App() {
  const [modal, setModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [zoom, setZoom] = useState(1);

  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__lwToast);
    window.__lwToast = window.setTimeout(() => setToast(""), 2800);
  };

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const calculateRisk = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/prediction", form);
      setPrediction(data);
    } catch {
      notify("Backend is not running. Start the MERN project with npm run dev.");
    }
  };

  const searchLocation = (e) => {
    e.preventDefault();
    if (!search.trim()) return notify("Enter a location to search.");
    setForm((p) => ({ ...p, location: search.trim() }));
    setModal(true);
    notify(`Searching risk information for ${search.trim()}…`);
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <button className="brand" onClick={() => go("home")}>
            <div className="brand-mark">
              <svg viewBox="0 0 60 60" aria-hidden="true">
                <path d="M3 48 22 17l12 18 8-13 15 26H3Z" fill="#F6FFFA"/>
                <path d="m3 48 19-17 8 9 12-18 15 26H3Z" fill="#62D994"/>
                <path d="m28 48 12-26 17 26H28Z" fill="#BDEDD0"/>
                <path d="m20 33 7 6 7-8-12-14-9 15 7 1Z" fill="#126B4E"/>
              </svg>
            </div>
            <div>
              <div className="brand-title">Landslide Watch</div>
              <div className="brand-subtitle">Safer Hills, Brighter Tomorrows</div>
            </div>
          </button>

          <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <nav className={`nav-links ${mobileMenu ? "open" : ""}`}>
            <button className="active" onClick={() => go("home")}>Home</button>
            <button onClick={() => { go("prediction"); setModal(true); }}>Prediction</button>
            <button onClick={() => go("live-map")}>Live Map</button>
            <button onClick={() => go("awareness")}>Awareness</button>
            <button onClick={() => go("about")}>About</button>
          </nav>

          <div className="nav-actions">
            <form className="search" onSubmit={searchLocation}>
              <Search size={19}/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location..." />
            </form>
            <button className="login-btn" onClick={() => notify("Authentication module can be connected here.")}>
              <LogIn size={18}/> Login
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="pill">Predict <span>•</span> Prepare <span>•</span> Stay Safe</div>
            <h1>Landslide Awareness<br/>for a <span>Safer Tomorrow</span></h1>
            <p>Real-time information, risk prediction and awareness resources to help communities stay safe from landslides.</p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => setModal(true)}>
                <BarChart3 size={20}/> Check Risk Now <ChevronRight size={19}/>
              </button>
              <button className="secondary-btn" onClick={() => go("live-map")}>
                <Map size={20}/> Explore Live Map
              </button>
            </div>
          </div>
          <div className="hero-quote">
            <div className="quote-mark">“</div>
            <p>Nature is powerful.<br/>Awareness saves lives.</p>
            <div className="quote-line"/>
          </div>
        </div>
      </section>

      <main className="container">
        <section className="quick-grid" id="prediction">
          <QuickCard icon={<BarChart3/>} title="Risk Prediction" text="Check landslide risk using key environmental factors." onClick={() => setModal(true)}/>
          <QuickCard icon={<MapPin/>} title="Live Map" text="View real-time landslide alerts and affected areas." onClick={() => go("live-map")}/>
          <QuickCard icon={<BookOpen/>} title="Learn & Prepare" text="Get information on causes, prevention and safety tips." onClick={() => go("awareness")}/>
          <QuickCard icon={<Users/>} title="Community" text="Stay informed and contribute to a safer environment." onClick={() => notify("Community reporting can be added as a MongoDB-backed feature.")}/>
        </section>

        <section className="main-grid">
          <div className="panel map-panel" id="live-map">
            <PanelHead icon={<Map/>} title="Landslide Risk Map" action="View Full Map →" onAction={() => notify("Full interactive map can be connected to Leaflet/Mapbox.")}/>
            <div className="map" style={{ transform: `scale(${zoom})` }}>
              <div className="map-controls">
                <button onClick={() => setZoom(Math.min(1.25, zoom + .1))}>+</button>
                <button onClick={() => setZoom(Math.max(.85, zoom - .1))}>−</button>
              </div>
              <MapLabel text="Dehradun" x="8%" y="37%"/>
              <MapLabel text="Tehri" x="47%" y="21%"/>
              <MapLabel text="Pauri" x="51%" y="60%"/>
              <MapLabel text="Chamoli" x="73%" y="45%"/>
              <MapLabel text="Rishikesh" x="16%" y="70%"/>
              <MapLabel text="Rudraprayag" x="73%" y="77%"/>
              <Marker tone="high" x="37%" y="17%"/>
              <Marker tone="high" x="59%" y="16%"/>
              <Marker tone="medium" x="29%" y="52%"/>
              <Marker tone="medium" x="47%" y="73%"/>
              <Marker tone="low" x="70%" y="40%"/>
              <Marker tone="high" x="86%" y="73%"/>
              <div className="legend">
                <span><i className="dot high"/>High Risk</span>
                <span><i className="dot medium"/>Moderate Risk</span>
                <span><i className="dot low"/>Low Risk</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <PanelHead icon={<Bell/>} title="Recent Alerts" action="View All →" onAction={() => notify("Showing current alerts.")}/>
            <div className="alert-list">
              {alerts.map((a) => (
                <div className={`alert ${a.tone}`} key={a.place}>
                  <span className={`alert-dot ${a.tone}`}/>
                  <div>
                    <strong>{a.level}</strong>
                    <div className="place">{a.place}</div>
                    <small>{a.detail}</small>
                  </div>
                  <time>{a.time}</time>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <PanelHead icon={<Activity/>} title="Key Statistics"/>
            <div className="stats">
              <Stat icon={<Leaf/>} value="128" label="Landslides (This Year)"/>
              <Stat icon={<Users/>} value="14" label="Districts Monitored"/>
              <Stat icon={<ShieldCheck/>} value="3" label="High Risk Areas" danger/>
              <Stat icon={<Users/>} value="1.2M" label="People in Risk Zones"/>
              <div className="resilience">
                <Leaf/>
                <div><strong>A more informed community</strong><span>creates a more resilient tomorrow.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel awareness" id="awareness">
          <PanelHead icon={<BookOpen/>} title="Landslide Awareness & Safety" action="Learn More →" onAction={() => notify("Use this section as your awareness module.")}/>
          <div className="awareness-grid">
            <Awareness title="Before a landslide">Know your local risk, prepare an emergency kit and identify safe evacuation routes.</Awareness>
            <Awareness title="During heavy rainfall">Avoid unstable slopes, blocked roads and drainage channels. Follow official alerts.</Awareness>
            <Awareness title="After an event">Stay away from the slide area because secondary failures can happen without warning.</Awareness>
          </div>
        </section>

        <section className="footer-note" id="about">Landslide Watch • MERN-based monitoring and awareness platform</section>
      </main>

      {modal && (
        <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-head">
              <div>
                <h2>Landslide Risk Prediction</h2>
                <p>Enter environmental conditions to calculate a demonstration risk score.</p>
              </div>
              <button className="close" onClick={() => setModal(false)}><X/></button>
            </div>

            <form onSubmit={calculateRisk}>
              <div className="form-grid">
                <Field label="LOCATION"><input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/></Field>
                <Field label="RAINFALL (mm / 24h)"><input type="number" value={form.rainfall} onChange={(e)=>setForm({...form,rainfall:e.target.value})}/></Field>
                <Field label="SLOPE ANGLE (°)"><input type="number" value={form.slope} onChange={(e)=>setForm({...form,slope:e.target.value})}/></Field>
                <Field label="SOIL MOISTURE (%)"><input type="number" value={form.moisture} onChange={(e)=>setForm({...form,moisture:e.target.value})}/></Field>
                <Field label="VEGETATION COVER (%)"><input type="number" value={form.vegetation} onChange={(e)=>setForm({...form,vegetation:e.target.value})}/></Field>
                <Field label="GROUND CONDITION">
                  <select value={form.ground} onChange={(e)=>setForm({...form,ground:e.target.value})}>
                    <option>Stable</option><option>Weathered</option><option>Highly weathered</option>
                  </select>
                </Field>
              </div>

              {prediction && (
                <div className="risk-result">
                  <div className="result-label">PREDICTED RISK</div>
                  <div className={`risk-score ${prediction.tone}`}>{prediction.score}% • {prediction.level}</div>
                  <div className="progress"><div style={{width:`${prediction.score}%`}}/></div>
                  <p>{prediction.message}</p>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setModal(false)}>Cancel</button>
                <button className="primary-btn small" type="submit">Calculate Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function QuickCard({icon,title,text,onClick}) {
  return <button className="quick-card" onClick={onClick}><div className="icon-box">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></button>
}
function PanelHead({icon,title,action,onAction}) {
  return <div className="panel-head"><div className="panel-title">{icon}{title}</div>{action && <button className="panel-link" onClick={onAction}>{action}</button>}</div>
}
function MapLabel({text,x,y}) { return <span className="map-label" style={{left:x,top:y}}>{text}</span> }
function Marker({tone,x,y}) { return <span className={`marker ${tone}`} style={{left:x,top:y}}/> }
function Stat({icon,value,label,danger}) { return <div className="stat"><div className={`stat-icon ${danger?"danger":""}`}>{icon}</div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></div> }
function Awareness({title,children}) { return <div className="awareness-card"><strong>{title}</strong><p>{children}</p></div> }
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }

export default App;
