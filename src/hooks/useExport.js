// src/hooks/useExport.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function useExport() {

  const exportarPDF = (titulo, columnas, filas, nombreArchivo = 'reporte') => {
    const doc = new jsPDF()

    // Header
    doc.setFillColor(99, 102, 241) // indigo
    doc.rect(0, 0, 210, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('🍽️ Restaurante — ' + titulo, 14, 16)

    // Fecha
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generado: ${new Date().toLocaleString('es-AR')}`,
      14, 22
    )

    // Tabla
    autoTable(doc, {
      startY: 30,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    })

    doc.save(`${nombreArchivo}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportarExcel = (titulo, columnas, filas, nombreArchivo = 'reporte') => {
    const datos = [columnas, ...filas]
    const hoja  = XLSX.utils.aoa_to_sheet(datos)

    // Ancho de columnas automático
    hoja['!cols'] = columnas.map(() => ({ wch: 20 }))

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, titulo.substring(0, 31))

    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' })
    const blob   = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return { exportarPDF, exportarExcel }
}