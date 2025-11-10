const DB_KEY = "datanet_db_v1";

const defaultDB = {
  meta: { version: 1, createdAt: Date.now() },
  empresas: [],        // [{id, nombre}]
  sedes: [],           // [{id, empresa_id, nombre, direccion}]
  dependencias: [],    // [{id, sede_id, nombre}]
  usuarios: [],        // [{id, dependencia_id, nombre, correo, telefono, cargo}]
  activos: [],         // [{id, empresa_id, sede_id, dependencia_id, usuario_id, categoria, estado, ...}]
  movimientos: [],     // [{id, activo_id, origen:{...}, destino:{...}, fecha}]
  mantenimientos: [],  // [{id, activo_id, tipo, fecha, notas}]
  adjuntos: []         // [{id, entidad, entidad_id, nombre, url}]
};

export function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  return raw ? JSON.parse(raw) : structuredClone(defaultDB);
}
export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
export function genId(prefix="id") {
  return `${prefix}_${(crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`)}`;
}
