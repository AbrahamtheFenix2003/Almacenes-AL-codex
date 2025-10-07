import * as XLSX from 'xlsx';

export type ExcelCellValue = string | number | boolean | Date | null | undefined;

export interface ExcelColumn<T> {
  header: string;
  accessor: (row: T, index: number) => ExcelCellValue;
}

export interface ExportToExcelOptions<T> {
  data: T[];
  columns: ExcelColumn<T>[];
  fileName: string;
  sheetName?: string;
}

export function exportToExcel<T>({ data, columns, fileName, sheetName = 'Reporte' }: ExportToExcelOptions<T>): void {
  if (typeof window === 'undefined') {
    console.warn('exportToExcel solo está disponible en entornos de navegador.');
    return;
  }

  if (!data.length) {
    console.warn('No hay datos para exportar.');
    return;
  }

  const headers = columns.map((column) => column.header);
  const body = data.map((row, rowIndex) =>
    columns.map((column) => {
      const value = column.accessor(row, rowIndex);
      if (value instanceof Date) {
        return XLSX.SSF.format('yyyy-mm-dd', value);
      }
      return value ?? '';
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalName, { compression: true });
}
