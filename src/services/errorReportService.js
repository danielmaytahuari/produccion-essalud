import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// Generar número correlativo mensual
export const generateReportNumber = async (month) => {
  try {
    const q = query(
      collection(db, 'error_reports'),
      where('month', '==', month),
      orderBy('reportNumber', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 1;
    }
    
    const lastReport = snapshot.docs[0].data();
    return lastReport.reportNumber + 1;
  } catch (error) {
    console.error('Error generando número:', error);
    return 1;
  }
};

// Crear reporte
export const createErrorReport = async (reportData) => {
  try {
    const month = reportData.examDate.substring(0, 7); // "2026-01"
    const reportNumber = await generateReportNumber(month);
    const reportId = `${month}-${String(reportNumber).padStart(3, '0')}`; // "2026-01-001"
    
    const report = {
      id: reportId,
      reportNumber,
      month,
      
      // Datos del paciente/estudio
      patientDNI: reportData.patientDNI,
      patientName: reportData.patientName.toUpperCase(),
      examDate: reportData.examDate,
      examTime: reportData.examTime,
      examType: reportData.examType,
      errorType: reportData.errorType,
      errorDescription: reportData.errorDescription,
      requestedAction: reportData.requestedAction,
      
      // Datos del reporte
      reportedBy: reportData.reportedBy,
      reportedByName: reportData.reportedByName,
      reportDate: new Date().toISOString(),
      
      // Validación admin
      status: 'pending',
      validatedBy: null,
      validatedByName: null,
      validationDate: null,
      validationNotes: '',
      checked: false
    };
    
    await setDoc(doc(db, 'error_reports', reportId), report);
    return report;
  } catch (error) {
    console.error('Error creando reporte:', error);
    throw error;
  }
};

// Obtener todos los reportes
export const getAllErrorReports = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'error_reports'));
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push(doc.data());
    });
    return reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    throw error;
  }
};

// Obtener reportes de un usuario
export const getReportsByUser = async (userDNI) => {
  try {
    const q = query(
      collection(db, 'error_reports'),
      where('reportedBy', '==', userDNI)
    );
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push(doc.data());
    });
    return reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  } catch (error) {
    console.error('Error obteniendo reportes del usuario:', error);
    throw error;
  }
};

// Obtener reportes pendientes
export const getPendingReports = async () => {
  try {
    const q = query(
      collection(db, 'error_reports'),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push(doc.data());
    });
    return reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  } catch (error) {
    console.error('Error obteniendo reportes pendientes:', error);
    throw error;
  }
};

// Actualizar reporte (admin)
export const updateErrorReport = async (reportId, updates) => {
  try {
    const reportRef = doc(db, 'error_reports', reportId);
    await updateDoc(reportRef, {
      ...updates,
      lastModified: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    throw error;
  }
};

// Validar reporte (admin)
export const validateErrorReport = async (reportId, adminDNI, adminName, notes = '') => {
  try {
    const reportRef = doc(db, 'error_reports', reportId);
    await updateDoc(reportRef, {
      status: 'validated',
      validatedBy: adminDNI,
      validatedByName: adminName,
      validationDate: new Date().toISOString(),
      validationNotes: notes,
      checked: true
    });
    return true;
  } catch (error) {
    console.error('Error validando reporte:', error);
    throw error;
  }
};

// Obtener reportes por mes
export const getReportsByMonth = async (month) => {
  try {
    const q = query(
      collection(db, 'error_reports'),
      where('month', '==', month)
    );
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push(doc.data());
    });
    return reports.sort((a, b) => a.reportNumber - b.reportNumber);
  } catch (error) {
    console.error('Error obteniendo reportes del mes:', error);
    throw error;
  }
};
