import { getDB, saveDB } from './storage.js';
import { createActivo } from './domain.js';

function exportarEquipos() {
  const db = getDB();
  const activos = db.activos;
  let csvContent = "Categoria,Estado,Marca,Modelo,Nro_Serie\n";

  activos.forEach(activo => {
    const row = `${activo.categoria},${activo.estado},${activo.marca},${activo.modelo},${activo.nro_serie}`;
    csvContent += row + "\n";
  });

  // Crear un archivo CSV y descargarlo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "equipos.csv";
  link.click();
}

function exportarEquiposXLSX() {
  const db = getDB();
  const activos = db.activos;
  
  // Crear una hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(activos);
  
  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Equipos");

  // Generar el archivo y descargarlo
  XLSX.writeFile(wb, "equipos.xlsx");
}

function importarCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const csvData = event.target.result;
        const equipos = parseCSV(csvData);
        const db = getDB();
        const empresa_id = db.empresas[0]?.id;
        if (!empresa_id) {
            alert("No hay una empresa de demostración para asignar los equipos.");
            return;
        }
        equipos.forEach(equipo => {
            createActivo(empresa_id, equipo);
        });
        alert("Equipos importados con éxito.");
        // Asumiendo que hay una función para recargar los datos en la página
        if (typeof loadFilterData === 'function') {
            loadFilterData();
        }
      };
      reader.readAsText(file);
    }
}

function parseCSV(csvData) {
    const rows = csvData.split("\n");
    const equipos = [];
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cols = row.split(",");
      if (cols.length === 5) { // Adaptado al nuevo formato
        equipos.push({
          categoria: cols[0],
          estado: cols[1],
          marca: cols[2],
          modelo: cols[3],
          nro_serie: cols[4]
        });
      }
    }
    return equipos;
}

function importarXLSX() {
    const fileInput = document.getElementById('xlsxFile');
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const data = event.target.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]]; // Leer la primera hoja
        const equipos = XLSX.utils.sheet_to_json(ws);
        
        const db = getDB();
        const empresa_id = db.empresas[0]?.id;
        if (!empresa_id) {
            alert("No hay una empresa de demostración para asignar los equipos.");
            return;
        }
        equipos.forEach(equipo => {
            createActivo(empresa_id, equipo);
        });

        alert("Equipos importados con éxito.");
        if (typeof loadFilterData === 'function') {
            loadFilterData();
        }
      };
      reader.readAsArrayBuffer(file);
    }
}

// Hacer las funciones accesibles globalmente si se llaman desde el HTML
window.exportarEquipos = exportarEquipos;
window.exportarEquiposXLSX = exportarEquiposXLSX;
window.importarCSV = importarCSV;
window.importarXLSX = importarXLSX;