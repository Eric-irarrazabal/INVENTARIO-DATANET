function exportarEquipos() {
  const equipos = JSON.parse(localStorage.getItem('equipos')) || [];
  let csvContent = "Nombre,Estado,Categoría,Marca,Modelo,Número de Serie,Fecha de Alta\n";

  equipos.forEach(equipo => {
    const row = `${equipo.nombre},${equipo.estado},${equipo.categoria},${equipo.marca},${equipo.modelo},${equipo.nro_serie},${equipo.fecha_alta}`;
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
  const equipos = JSON.parse(localStorage.getItem('equipos')) || [];
  
  // Crear una hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(equipos);
  
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
        // Validar y agregar los equipos a localStorage
        localStorage.setItem('equipos', JSON.stringify(equipos));
        alert("Equipos importados con éxito.");
        mostrarEquipos(); // Actualizar la lista
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
      if (cols.length === 7) { // Validación básica
        equipos.push({
          nombre: cols[0],
          estado: cols[1],
          categoria: cols[2],
          marca: cols[3],
          modelo: cols[4],
          nro_serie: cols[5],
          fecha_alta: cols[6]
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
        
        // Validar y agregar los equipos a localStorage
        localStorage.setItem('equipos', JSON.stringify(equipos));
        alert("Equipos importados con éxito.");
        mostrarEquipos(); // Actualizar la lista
      };
      reader.readAsArrayBuffer(file);
    }
}