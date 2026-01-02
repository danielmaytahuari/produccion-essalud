// dbService.js - Servicio de Base de Datos (Firestore)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
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

// Obtener registros de producción por usuario
export const getProductionByUser = async (dni) => {
  try {
    const q = query(collection(db, 'production'), where('dni', '==', dni));
    const productionSnapshot = await getDocs(q);
    const records = [];
    productionSnapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });
    return records;
  } catch (error) {
    console.error('Error al obtener producción del usuario:', error);
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
    const idString = String(id);  // ✅ Convertir a string
    const prodRef = doc(db, 'production', idString);
    await updateDoc(prodRef, data);
    return data;
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
};
