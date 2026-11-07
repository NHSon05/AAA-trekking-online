// Fetch real Son Tra road geometry from OpenStreetMap (Overpass API) and write src/data/osmRoute.json
// Run: node scripts/fetch-osm.mjs     Data © OpenStreetMap contributors (ODbL)
import { writeFileSync, mkdirSync } from "node:fs";

const BBOX = "16.085,108.255,16.140,108.340"; // S,W,N,E
const START = { id: "linh-ung-viewpoint", lat: 16.0990699, lon: 108.2772223 }; // OSM node 11171188211
const SUMMIT = { id: "ban-co-peak", lat: 16.1189286, lon: 108.2720036 }; // OSM node 1538334281
const BANYAN = { id: "heritage-banyan", lat: 16.1226157, lon: 108.3316779 }; // OSM node 6346486685

const query = `[out:json][timeout:90];
way["highway"~"^(primary|secondary|tertiary|unclassified|residential|service|track|path|footway|trunk)$"](${BBOX});
out geom;`;

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "User-Agent": "aaa-trekking-online/1.0 (student project)", Accept: "application/json" },
  body: new URLSearchParams({ data: query }),
});
if (!res.ok) throw new Error(`Overpass ${res.status}`);
const { elements } = await res.json();

// Build graph keyed by rounded coordinate
const key = (p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
const hav = (a, b) => {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const nodes = new Map();
const adj = new Map();
const add = (a, b) => {
  const ka = key(a), kb = key(b);
  nodes.set(ka, a); nodes.set(kb, b);
  const d = hav(a, b);
  (adj.get(ka) ?? adj.set(ka, []).get(ka)).push([kb, d]);
  (adj.get(kb) ?? adj.set(kb, []).get(kb)).push([ka, d]);
};
for (const w of elements) for (let i = 1; i < w.geometry.length; i++) add(w.geometry[i - 1], w.geometry[i]);

const nearest = (p) => {
  let best = null, bd = Infinity;
  for (const [k, n] of nodes) { const d = hav(p, n); if (d < bd) { bd = d; best = k; } }
  return { k: best, d: bd };
};
function dijkstra(from, to) {
  const dist = new Map([[from, 0]]), prev = new Map(), done = new Set();
  while (true) {
    let u = null, ud = Infinity;
    for (const [k, d] of dist) if (!done.has(k) && d < ud) { u = k; ud = d; }
    if (u === null) return null;
    if (u === to) break;
    done.add(u);
    for (const [v, w] of adj.get(u) ?? []) {
      const nd = ud + w;
      if (nd < (dist.get(v) ?? Infinity)) { dist.set(v, nd); prev.set(v, u); }
    }
  }
  const path = []; for (let k = to; k; k = prev.get(k)) path.push(nodes.get(k));
  return { path: path.reverse(), length: dist.get(to) };
}

const s = nearest(START), e = nearest(SUMMIT), b = nearest(BANYAN);
console.log("snap distances (m):", s.d.toFixed(0), e.d.toFixed(0), b.d.toFixed(0), "graph nodes:", nodes.size);
const main = dijkstra(s.k, e.k);
const spur = dijkstra(e.k, b.k);
console.log("main route:", main && main.length.toFixed(0), "m, pts", main?.path.length);
console.log("banyan route:", spur && spur.length.toFixed(0), "m, pts", spur?.path.length);

mkdirSync("src/data", { recursive: true });
const round = (p) => [+p.lat.toFixed(6), +p.lon.toFixed(6)];
writeFileSync("src/data/osmRoute.json", JSON.stringify({
  attribution: "© OpenStreetMap contributors (ODbL)",
  fetchedAt: new Date().toISOString(),
  start: START, summit: SUMMIT, banyan: BANYAN,
  mainLengthM: main?.length, banyanLengthM: spur?.length,
  main: main?.path.map(round),
  banyanSpur: spur?.path.map(round),
}));
