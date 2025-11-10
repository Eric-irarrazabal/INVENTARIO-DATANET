import { getDB, saveDB } from "./storage.js";
import { createEmpresa, createSede, createDependencia, createUsuario, createActivo, assignActivo } from "./domain.js";

(function migrateV0toV1(){
  const rawSedes = JSON.parse(localStorage.getItem('sedes')||'null');
  const rawDeps  = JSON.parse(localStorage.getItem('dependencias')||'null');
  const rawUsers = JSON.parse(localStorage.getItem('usuarios')||'null');
  const rawEq    = JSON.parse(localStorage.getItem('equipos')||'null');

  const db = getDB();
  if (db.meta.version === 1 && !rawSedes && !rawDeps && !rawUsers && !rawEq) return; // nada que migrar

  // 1 empresa demo si no existe
  let emp = db.empresas[0];
  if(!emp){ emp = createEmpresa("Empresa Demo"); }

  // Mapas auxiliares
  const sedemap = new Map();
  const depmap  = new Map();
  const usrmap  = new Map();

  // Sedes
  (rawSedes||[]).forEach(s=>{
    const x = createSede(emp.id, s.nombre, s.direccion||"");
    sedemap.set(s.id, x.id);
  });

  // Dependencias
  (rawDeps||[]).forEach(d=>{
    const sede_id = sedemap.get(d.sede_id) || (db.sedes[0]?.id || null);
    const x = createDependencia(sede_id, d.nombre);
    depmap.set(d.id, x.id);
  });

  // Usuarios
  (rawUsers||[]).forEach(u=>{
    // si venía con textos, intenta empatar por nombre; si no, cae a primera dep
    const dep = db.dependencias.find(d=>d.nombre===u.dependencia) || db.dependencias[0];
    const x = createUsuario(dep.id, { nombre:u.nombre, correo:u.correo, telefono:u.telefono||null, cargo:u.cargo||null });
    usrmap.set(u.id, x.id);
  });

  // Activos
  (rawEq||[]).forEach(e=>{
    const sede = db.sedes.find(s=>s.nombre===e.sede) || null;
    const dep  = db.dependencias.find(d=>d.nombre===e.dependencia) || null;
    const usr  = db.usuarios.find(u=>u.nombre===e.usuario) || null;
    const a = createActivo(emp.id, {
      sede_id: sede?.id||null, dependencia_id: dep?.id||null, usuario_id: usr?.id||null,
      categoria: e.categoria||"Equipo", estado: e.estado||"activo", marca:e.marca||null, modelo:e.modelo||null, nro_serie:e.nro_serie||null
    });
    if (usr || dep || sede) assignActivo(a.id, { sede_id: sede?.id??null, dependencia_id: dep?.id??null, usuario_id: usr?.id??null });
  });

  // Limpieza de claves viejas
  localStorage.removeItem('sedes'); localStorage.removeItem('dependencias'); localStorage.removeItem('usuarios'); localStorage.removeItem('equipos');

  // Marca versión correcta
  const final = getDB(); final.meta.version = 1; saveDB(final);
})();
