// frontend/scripts/control_acceso.js
(function authGuard() {
  // 1) Detectar si la página es pública por meta o por nombre
  const current = location.pathname.split('/').pop() || 'index.html';
  const PUBLIC = new Set(['login.html']);
  const isPublicMeta = !!document.querySelector('meta[name="public-page"][content="true"]');
  const isPublic = isPublicMeta || PUBLIC.has(current);
  if (isPublic) return;

  // 2) Validar sesión
  const sesion = JSON.parse(localStorage.getItem('usuario_autenticado') || 'null');
  const exp = Number(localStorage.getItem('session_expires') || 0);
  const expired = !exp || Date.now() > exp;

  if (!sesion || expired) {
    localStorage.removeItem('usuario_autenticado');
    localStorage.removeItem('session_expires');
    location.replace('login.html'); // redirige solo en privadas
    return;
  }
})();