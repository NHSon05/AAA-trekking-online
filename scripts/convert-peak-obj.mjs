// One-off conversion of the supplied high-poly summit OBJ into a compact glTF.
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import readline from "node:readline";
import { MeshoptSimplifier } from "meshoptimizer";

const sourceDir = "model/3D-Model-2026-11-07T09-06-00-246Z";
const outputDir = "public/models/ban-co-summit";
const sourcePath = `${sourceDir}/RIP0.obj`;
const numbers = (line) => line.trim().split(/\s+/).slice(1).map(Number);

async function scan(onLine) {
  const stream = readline.createInterface({ input: createReadStream(sourcePath), crlfDelay: Infinity });
  for await (const line of stream) onLine(line);
}

let vertexCount = 0, uvCount = 0, normalCount = 0, indexCount = 0;
await scan((line) => {
  if (line.startsWith("v ")) vertexCount++;
  else if (line.startsWith("vt ")) uvCount++;
  else if (line.startsWith("vn ")) normalCount++;
  else if (line.startsWith("f ")) {
    const corners = line.trim().split(/\s+/).length - 1;
    indexCount += (corners - 2) * 3;
  }
});
console.log({ vertexCount, uvCount, normalCount, triangleCount: indexCount / 3 });

let positions = new Float32Array(vertexCount * 3);
let uvs = new Float32Array(uvCount * 2);
let normals = new Float32Array(normalCount * 3);
const rawIndices = new Uint32Array(indexCount);
let vp = 0, up = 0, np = 0, ip = 0;
await scan((line) => {
  if (line.startsWith("v ")) {
    positions.set(numbers(line), vp); vp += 3;
  } else if (line.startsWith("vt ")) {
    const [u, v] = numbers(line);
    uvs[up++] = u; uvs[up++] = 1 - v;
  } else if (line.startsWith("vn ")) {
    normals.set(numbers(line), np); np += 3;
  } else if (line.startsWith("f ")) {
    const corners = line.trim().split(/\s+/).slice(1).map((token) => Number(token.split("/")[0]) - 1);
    for (let i = 1; i < corners.length - 1; i++) {
      rawIndices[ip++] = corners[0]; rawIndices[ip++] = corners[i]; rawIndices[ip++] = corners[i + 1];
    }
  }
});

await MeshoptSimplifier.ready;
const targetIndices = Math.floor((rawIndices.length * 0.28) / 3) * 3;
const [indices, error] = MeshoptSimplifier.simplify(rawIndices, positions, 3, targetIndices, 0.012);
console.log({ optimizedTriangles: indices.length / 3, simplificationError: error });

const remap = new Int32Array(vertexCount);
remap.fill(-1);
const used = [];
for (let i = 0; i < indices.length; i++) {
  const source = indices[i];
  if (remap[source] === -1) { remap[source] = used.length; used.push(source); }
  indices[i] = remap[source];
}
const compactPositions = new Float32Array(used.length * 3);
const compactNormals = new Float32Array(used.length * 3);
const compactUvs = new Float32Array(used.length * 2);
used.forEach((source, index) => {
  compactPositions.set(positions.subarray(source * 3, source * 3 + 3), index * 3);
  compactNormals.set(normals.subarray(source * 3, source * 3 + 3), index * 3);
  compactUvs.set(uvs.subarray(source * 2, source * 2 + 2), index * 2);
});
positions = compactPositions;
normals = compactNormals;
uvs = compactUvs;
const compactVertexCount = used.length;
console.log({ compactVertexCount });

let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < positions.length; i += 3) for (let axis = 0; axis < 3; axis++) {
  min[axis] = Math.min(min[axis], positions[i + axis]);
  max[axis] = Math.max(max[axis], positions[i + axis]);
}
console.log({ min, max });

const bufferParts = [];
let byteLength = 0;
function addView(typed, target) {
  const bytes = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
  const padding = (4 - (byteLength % 4)) % 4;
  if (padding) { bufferParts.push(Buffer.alloc(padding)); byteLength += padding; }
  const offset = byteLength;
  bufferParts.push(bytes); byteLength += bytes.length;
  return { buffer: 0, byteOffset: offset, byteLength: bytes.length, ...(target ? { target } : {}) };
}

const bufferViews = [
  addView(positions, 34962),
  addView(normals, 34962),
  addView(uvs, 34962),
  addView(indices, 34963),
];
const imageNames = [
  "60171472-5930-4220-b343-5fb36504f28b.png",
  "cf85d985-7461-4496-b5e3-f2247b78513d.png",
  "7fe72a07-2ec1-4c21-b586-06eb6198599f.png",
];
await mkdir(outputDir, { recursive: true });
const binPath = `${outputDir}/ban-co-summit.bin`;
await writeFile(binPath, Buffer.concat(bufferParts));
for (const name of imageNames) await writeFile(`${outputDir}/${name}`, await readFile(`${sourceDir}/${name}`));

const gltf = {
  asset: { version: "2.0", generator: "Son Tra trekking model conversion" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: "Ban Co Summit Model" }],
  meshes: [{ name: "Ban Co Summit", primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
  materials: [{ name: "Summit scanned stone", pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicRoughnessTexture: { index: 2 }, metallicFactor: 0, roughnessFactor: 0.82 }, normalTexture: { index: 1 }, doubleSided: true }],
  textures: [{ source: 0 }, { source: 1 }, { source: 2 }],
  images: [{ uri: imageNames[0] }, { uri: imageNames[1] }, { uri: imageNames[2] }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
  buffers: [{ uri: "ban-co-summit.bin", byteLength }],
  bufferViews,
  accessors: [
    { bufferView: 0, componentType: 5126, count: compactVertexCount, type: "VEC3", min, max },
    { bufferView: 1, componentType: 5126, count: compactVertexCount, type: "VEC3" },
    { bufferView: 2, componentType: 5126, count: compactVertexCount, type: "VEC2" },
    { bufferView: 3, componentType: 5125, count: indices.length, type: "SCALAR", min: [0], max: [used.length - 1] },
  ],
};
await writeFile(`${outputDir}/ban-co-summit.gltf`, JSON.stringify(gltf));
