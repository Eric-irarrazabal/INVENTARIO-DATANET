import { getDB, saveDB, genId } from "./storage.js";

// CREATE
export function createEmpresa(nombre){ const db=getDB(); const x={id:genId("emp"), nombre}; db.empresas.push(x); saveDB(db); return x; }
export function createSede(empresa_id, nombre, direccion=""){ const db=getDB(); if(!db.empresas.find(e=>e.id===empresa_id)) throw new Error("Empresa no existe"); const x={id:genId("sed"), empresa_id, nombre, direccion}; db.sedes.push(x); saveDB(db); return x; }
export function createDependencia(sede_id, nombre){ const db=getDB(); if(!db.sedes.find(s=>s.id===sede_id)) throw new Error("Sede no existe"); const x={id:genId("dep"), sede_id, nombre}; db.dependencias.push(x); saveDB(db); return x; }
export function createUsuario(dependencia_id, u){ const db=getDB(); if(!db.dependencias.find(d=>d.id===dependencia_id)) throw new Error("Dependencia no existe"); const x={id:genId("usr"), dependencia_id, nombre:u.nombre, correo:u.correo||null, telefono:u.telefono||null, cargo:u.cargo||null, contrasena:u.contrasena||null}; db.usuarios.push(x); saveDB(db); return x; }

export function createActivo(empresa_id, a){
  const db=getDB();
  const empresa = db.empresas.find(e=>e.id===empresa_id); if(!empresa) throw new Error("Empresa no existe");
  const sede = a.sede_id ? db.sedes.find(s=>s.id===a.sede_id && s.empresa_id===empresa_id) : null; if(a.sede_id && !sede) throw new Error("Sede inválida");
  const dep  = a.dependencia_id ? db.dependencias.find(d=>d.id===a.dependencia_id) : null; if(a.dependencia_id && (!dep || (sede && dep.sede_id!==sede.id))) throw new Error("Dependencia no pertenece a la Sede");
  const usr  = a.usoario_id ? db.usuarios.find(u=>u.id===a.usuario_id) : null; // typo intencionalmente evitado
  if(a.usuario_id){ const u=db.usuarios.find(u=>u.id===a.usuario_id); if(!u || (dep && u.dependencia_id!==dep.id)) throw new Error("Usuario no pertenece a la Dependencia"); }
  const x={ id:genId("act"), empresa_id, sede_id:a.sede_id||null, dependencia_id:a.dependencia_id||null, usuario_id:a.usuario_id||null, categoria:a.categoria, estado:a.estado||"activo", marca:a.marca||null, modelo:a.modelo||null, nro_serie:a.nro_serie||null };
  db.activos.push(x); saveDB(db); return x;
}

export function createAdjunto(entidad, entidad_id, adjunto) {
    const db = getDB();
    // Validar que la entidad exista (ej: un activo)
    const ent = db[entidad]?.find(e => e.id === entidad_id);
    if (!ent) throw new Error(`La entidad '${entidad}' con id '${entidad_id}' no existe.`);

    const x = {
        id: genId("adj"),
        entidad,
        entidad_id,
        nombre: adjunto.nombre,
        url: adjunto.url || null,
        // Campos adicionales para licencias
        producto: adjunto.producto,
        fecha_compra: adjunto.fecha_compra,
        fecha_expira: adjunto.fecha_expira,
        proveedor: adjunto.proveedor
    };
    db.adjuntos.push(x);
    saveDB(db);
    return x;
}

// ASSIGN / UNASSIGN
export function assignActivo(activo_id, {sede_id=null, dependencia_id=null, usuario_id=null}){
  const db=getDB(); const a=db.activos.find(x=>x.id===activo_id); if(!a) throw new Error("Activo no existe");
  const sede = sede_id ? db.sedes.find(s=>s.id===sede_id && s.empresa_id===a.empresa_id) : null; if(sede_id && !sede) throw new Error("Sede inválida");
  const dep  = dependencia_id ? db.dependencias.find(d=>d.id===dependencia_id) : null; if(dependencia_id && (!dep || (sede && dep.sede_id!==sede.id))) throw new Error("Dependencia no pertenece a la Sede");
  if(usuario_id){ const u=db.usuarios.find(u=>u.id===usuario_id); if(!u || (dep && u.dependencia_id!==dep.id)) throw new Error("Usuario no pertenece a la Dependencia"); }
  const origen={sede_id:a.sede_id, dependencia_id:a.dependencia_id, usuario_id:a.usuario_id};
  if(sede_id!==null) a.sede_id=sede_id;
  if(dependencia_id!==null) a.dependencia_id=dependencia_id;
  if(usuario_id!==null) a.usuario_id=usuario_id;
  db.movimientos.push({id:genId("mov"), activo_id:a.id, origen, destino:{sede_id:a.sede_id, dependencia_id:a.dependencia_id, usuario_id:a.usuario_id}, fecha:new Date().toISOString()});
  saveDB(db); return a;
}
export function unassignActivo(activo_id, scope="all"){
  const db=getDB(); const a=db.activos.find(x=>x.id===activo_id); if(!a) throw new Error("Activo no existe");
  const origen={sede_id:a.sede_id, dependencia_id:a.dependencia_id, usuario_id:a.usuario_id};
  if(scope==="usuario"||scope==="all") a.usuario_id=null;
  if(scope==="dependencia"||scope==="all") a.dependencia_id=null;
  if(scope==="sede"||scope==="all") a.sede_id=null;
  db.movimientos.push({id:genId("mov"), activo_id:a.id, origen, destino:{sede_id:a.sede_id, dependencia_id:a.dependencia_id, usuario_id:a.usuario_id}, fecha:new Date().toISOString()});
  saveDB(db); return a;
}

// LISTADOS
export function listActivos({empresa_id, sede_id=null, dependencia_id=null, usuario_id=null, categoria=null}={}){
  const db=getDB(); let q=db.activos.filter(a=>a.empresa_id===empresa_id);
  if(sede_id!==null) q=q.filter(a=>a.sede_id===sede_id);
  if(dependencia_id!==null) q=q.filter(a=>a.dependencia_id===dependencia_id);
  if(usuario_id!==null) q=q.filter(a=>a.usuario_id===usuario_id);
  if(categoria) q=q.filter(a=>a.categoria===categoria);
  return q;
}
