// dbService.js - Servicio de Base de Datos (Firestore)
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot  
} from 'firebase/firestore';

import { db } from '../firebase';

// ==================== USUARIOS ====================

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener un usuario por DNI
export const getUserByDNI = async (dni) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', dni));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Crear o actualizar usuario
export const saveUser = async (userData) => {
  try {
    // Asegurar que DNI sea string
    const dniString = String(userData.dni);
    
    const userRef = doc(db, 'users', dniString);
    await setDoc(userRef, {
      dni: dniString,
      fullname: userData.fullname,
      password: userData.password,
      createdAt: new Date().toISOString()
    });
    
    return userData;
  } catch (error) {
    console.error('Error en saveUser:', error);
    throw error;
  }
};
// Eliminar usuario
export const deleteUser = async (dni) => {
  try {
    const dniString = String(dni);  // ✅ Convertir a string
    const userRef = doc(db, 'users', dniString);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error('Error en deleteUser:', error);
    throw error;
  }
};

// ==================== REGISTROS DE PRODUCCIÓN ====================

// Obtener todos los registros de producción
export const getAllProduction = async () => {
  try {
    const productionSnapshot = await getDocs(collection(db, 'production'));
    const records = [];
    productionSnapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });
    return records;
  } catch (error) {
    console.error('Error al obtener producción:', error);
    throw error;
  }
};

export const getProductionByUser = async (userDNI) => {
  try {
    const dniString = String(userDNI);
    const q = query(collection(db, 'production'), where('user', '==', dniString));
    const querySnapshot = await getDocs(q);
    const productions = [];
    querySnapshot.forEach((doc) => {
      productions.push({ id: doc.id, ...doc.data() });
    });
    return productions;
  } catch (error) {
    console.error('Error en getProductionByUser:', error);
    throw error;
  }
};

// Obtener registros de producción por mes
export const getProductionByMonth = async (year, month) => {
  try {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const q = query(
      collection(db, 'production'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const productionSnapshot = await getDocs(q);
    const records = [];
    productionSnapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });
    return records;
  } catch (error) {
    console.error('Error al obtener producción del mes:', error);
    throw error;
  }
};

// Agregar registro de producción
export const addProduction = async (productionData) => {
  try {
    const idString = String(productionData.id);  // ✅ Convertir a string
    const prodRef = doc(db, 'production', idString);
    await setDoc(prodRef, {
      ...productionData,
      id: idString  // Guardar también como string
    });
    return { ...productionData, id: idString };
  } catch (error) {
    console.error('Error en addProduction:', error);
    throw error;
  }
};

// Actualizar registro de producción
export const updateProduction = async (id, data) => {
  try {
    const idString = String(id);
    const prodRef = doc(db, 'production', idString);
    
    // Usar setDoc con merge:true para crear si no existe
    await setDoc(prodRef, {
      ...data,
      id: idString,
      updatedAt: new Date().toISOString()
    }, { merge: true });  // ✅ Crea o actualiza
    
    return { ...data, id: idString };
  } catch (error) {
    console.error('Error en updateProduction:', error);
    throw error;
  }
};

// Eliminar registro de producción
export const deleteProduction = async (id) => {
  try {
    const idString = String(id);  // ✅ Convertir a string
    const prodRef = doc(db, 'production', idString);
    await deleteDoc(prodRef);
    return true;
  } catch (error) {
    console.error('Error en deleteProduction:', error);
    throw error;
  }
};

// ==================== SALAS ====================

// Obtener configuración de salas
export const getSalas = async () => {
  try {
    const salasDoc = await getDoc(doc(db, 'config', 'salas'));
    if (salasDoc.exists()) {
      return salasDoc.data().list || [];
    }
    return [];
  } catch (error) {
    console.error('Error al obtener salas:', error);
    throw error;
  }
};

// Guardar configuración de salas
export const saveSalas = async (salasList) => {
  try {
    await setDoc(doc(db, 'config', 'salas'), { list: salasList });
    return { success: true };
  } catch (error) {
    console.error('Error al guardar salas:', error);
    throw error;
  }
};

// ==================== CONFIGURACIÓN ====================

// Obtener configuración de administrador
export const getAdminConfig = async () => {
  try {
    const adminDoc = await getDoc(doc(db, 'config', 'admin'));
    if (adminDoc.exists()) {
      return adminDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error al obtener configuración de admin:', error);
    throw error;
  }
};

// Guardar configuración de administrador
export const saveAdminConfig = async (adminDNI) => {
  try {
    await setDoc(doc(db, 'config', 'admin'), { dni: adminDNI });
    return { success: true };
  } catch (error) {
    console.error('Error al guardar configuración de admin:', error);
    throw error;
  }
};

// ==================== LISTENERS EN TIEMPO REAL ====================

// Escuchar cambios en usuarios
export const listenToUsers = (callback) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    callback(users);
  });
};

// Escuchar cambios en producción
export const listenToProduction = (callback) => {
  return onSnapshot(collection(db, 'production'), (snapshot) => {
    const records = [];
    snapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });
    callback(records);
  });

// ==================== FUNCIONES DE REPORTES DE ERRORES ====================

export const createErrorReport = async (reportData) => {
  try {
    const reportsRef = collection(db, 'error_reports');
    
    // Generar número correlativo mensual
    const month = reportData.examDate.substring(0, 7); // "2026-01"
    const monthReportsQuery = query(
      reportsRef,
      where('month', '==', month),
      orderBy('reportNumber', 'desc'),
      limit(1)
    );
    
    const monthReportsSnapshot = await getDocs(monthReportsQuery);
    const lastNumber = monthReportsSnapshot.empty ? 0 : monthReportsSnapshot.docs[0].data().reportNumber;
    const newNumber = lastNumber + 1;
    
    const reportId = `${month}-${String(newNumber).padStart(3, '0')}`;
    
    const newReport = {
      ...reportData,
      id: reportId,
      reportNumber: newNumber,
      month: month,
      status: 'pending',
      validatedBy: null,
      validatedByName: null,
      validationDate: null,
      validationNotes: '',
      checked: false,
      reportDate: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'error_reports', reportId), newReport);
    return newReport;
  } catch (error) {
    console.error('Error creando reporte:', error);
    throw error;
  }
};

export const getAllErrorReports = async () => {
  try {
    const reportsRef = collection(db, 'error_reports');
    const q = query(reportsRef, orderBy('reportDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }
};

export const getReportsByUser = async (userDNI) => {
  try {
    const reportsRef = collection(db, 'error_reports');
    const q = query(
      reportsRef,
      where('reportedBy', '==', userDNI),
      orderBy('reportDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo reportes del usuario:', error);
    return [];
  }
};

export const getPendingReports = async () => {
  try {
    const reportsRef = collection(db, 'error_reports');
    const q = query(
      reportsRef,
      where('status', '==', 'pending'),
      orderBy('reportDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo reportes pendientes:', error);
    return [];
  }
};

export const updateErrorReport = async (reportId, updates) => {
  try {
    const reportRef = doc(db, 'error_reports', reportId);
    await updateDoc(reportRef, updates);
    return true;
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    throw error;
  }
};

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

export const getReportsByMonth = async (month) => {
  try {
    const reportsRef = collection(db, 'error_reports');
    const q = query(
      reportsRef,
      where('month', '==', month),
      orderBy('reportNumber', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo reportes del mes:', error);
    return [];
  }
};
  
};
