// migrateData.js - Script para migrar datos de localStorage a Firebase
// Este script se ejecuta UNA VEZ en la consola del navegador para migrar tus datos actuales

import { saveUser, addProduction, saveSalas, saveAdminConfig } from './dbService';

export const migrateLocalStorageToFirebase = async () => {
  console.log('🔄 Iniciando migración de datos...');
  
  try {
    // 1. MIGRAR USUARIOS
    console.log('📦 Migrando usuarios...');
    const users = JSON.parse(localStorage.getItem('production-users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('production-passwords') || '{}');
    const fullnames = JSON.parse(localStorage.getItem('production-fullnames') || '{}');
    
    for (const dni of users) {
      await saveUser(dni, {
        dni: dni,
        fullname: fullnames[dni] || '',
        password: passwords[dni] || '',
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Usuario migrado: ${dni}`);
    }
    
    // 2. MIGRAR REGISTROS DE PRODUCCIÓN
    console.log('📦 Migrando registros de producción...');
    const production = JSON.parse(localStorage.getItem('production-records') || '[]');
    
    for (const record of production) {
      await addProduction({
        dni: record.dni,
        date: record.date,
        shift: record.shift,
        room: record.room,
        count: record.count,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ ${production.length} registros de producción migrados`);
    
    // 3. MIGRAR SALAS
    console.log('📦 Migrando configuración de salas...');
    const salas = JSON.parse(localStorage.getItem('production-salas') || '[]');
    await saveSalas(salas);
    console.log(`✅ ${salas.length} salas migradas`);
    
    // 4. MIGRAR CONFIGURACIÓN DE ADMIN
    console.log('📦 Migrando configuración de admin...');
    const admin = localStorage.getItem('production-admin');
    if (admin) {
      await saveAdminConfig(admin);
      console.log(`✅ Admin configurado: ${admin}`);
    }
    
    console.log('\n✨ ¡MIGRACIÓN COMPLETADA!');
    console.log(`📊 Resumen:`);
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Registros de producción: ${production.length}`);
    console.log(`- Salas: ${salas.length}`);
    console.log(`- Admin: ${admin || 'No configurado'}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    return { success: false, error };
  }
};

// Para ejecutar la migración, llama a esta función desde la consola:
// migrateLocalStorageToFirebase();
