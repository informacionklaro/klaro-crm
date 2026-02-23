import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], fileName: string) => {
  // 1. Convertimos los datos JSON a una hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Creamos un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();

  // 3. Añadimos la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  // 4. Descargamos el archivo
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toLocaleDateString("es-VE").replace(/\//g, "-")}.xlsx`,
  );
};
