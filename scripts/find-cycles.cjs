const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files = files.concat(listFiles(full));
    } else if (ent.isFile() && full.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const files = listFiles(src);
const importRegex = /import\s+(?:[^'\"]+from\s+)?['\"]([\.\/@][^'\"]+)['\"]/g;

const map = new Map();
const normalize = (p) => {
  if (p.startsWith('@/')) {
    const rel = p.replace('@/','src/');
    const abs = path.join(root, rel);
    if (fs.existsSync(abs + '.ts')) return path.resolve(abs + '.ts');
    if (fs.existsSync(abs + '/index.ts')) return path.resolve(abs + '/index.ts');
    return path.resolve(abs);
  }

  if (p.startsWith('.')) {
    return p; // resolve relative later based on importer
  }

  return p;
};

for (const file of files) {
  const txt = fs.readFileSync(file, 'utf8');
  const imports = [];
  let m;
  while ((m = importRegex.exec(txt)) !== null) {
    let imp = normalize(m[1]);
    if (imp.startsWith('.')) {
      // resolve relative to file
      const resolved = path.resolve(path.dirname(file), imp) + '.ts';
      if (fs.existsSync(resolved)) {
        imp = resolved;
      } else if (fs.existsSync(path.resolve(path.dirname(file), imp, 'index.ts'))) {
        imp = path.resolve(path.dirname(file), imp, 'index.ts');
      } else {
        imp = path.resolve(path.dirname(file), imp);
      }
    }
    imports.push(imp);
  }
  map.set(path.resolve(file), imports);
}

function findCycles(start) {
  const cycles = [];
  const visited = new Set();

  function dfs(node, pathArr) {
    if (!map.has(node)) return;
    const neighbors = map.get(node);
    for (const n of neighbors) {
      if (!n.startsWith(path.resolve(root))) continue;
      const resolved = n;
      if (pathArr.includes(resolved)) {
        const cycle = pathArr.slice(pathArr.indexOf(resolved)).concat([resolved]);
        cycles.push(cycle);
        continue;
      }
      if (visited.has(resolved)) continue;
      visited.add(resolved);
      dfs(resolved, pathArr.concat([resolved]));
    }
  }
  dfs(start, [start]);
  return cycles;
}

const targets = [
  'src/server/repositories/inspection.repository.ts',
  'src/server/services/inspection.service.ts',
  'src/server/repositories/inspection-response.repository.ts',
  'src/server/services/inspection-response.service.ts',
  'src/lib/api/inspection.functions.ts',
  'src/lib/api/inspection-response.functions.ts',
];

const absTargets = targets.map(t => path.resolve(root, t)).filter(p => fs.existsSync(p));

const allCycles = new Set();
for (const t of absTargets) {
  const cycles = findCycles(t);
  for (const c of cycles) {
    allCycles.add(c.join(' -> '));
  }
}

if (allCycles.size === 0) {
  console.log('No cycles detected starting from targets.');
} else {
  console.log('Cycles detected:');
  for (const c of allCycles) console.log(c);
}
