import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, UserPlus, UserCog, Trash2, KeyRound, Edit3, X, Check } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getAllUsers,
  saveUser,
  deleteUser as deleteUserDB,
  getAllProduction,
  getProductionByUser,
  addProduction as addProductionDB,
  updateProduction as updateProductionDB,
  deleteProduction as deleteProductionDB,
  getSalas,
  saveSalas
} from './dbService';

export default function ProductionSystem() {
  const ADMIN_KEY = 'Essalud2025*';

  // ===== ESTADOS PRINCIPALES =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Login
  const [loginDNI, setLoginDNI] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Usuarios (Tecnólogos)
  const [users, setUsers] = useState([]);
  const [userPasswords, setUserPasswords] = useState({});
  const [userFullNames, setUserFullNames] = useState({});

  // Registro público
  const [showRegister, setShowRegister] = useState(false);
  const [newDNI, setNewDNI] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Producción
  const [productions, setProductions] = useState([]);
  const [items] = useState(['Rx consulta externa', 'Rx consulta externa 2', 'Rx consulta externa 3', 'Rx emergencia', 'Rx hospitalizados', 'Rx especiales', 'Urvi', 'Rx portatil', 'Mamografia', 'Colocacion Arpon', 'Densitometria', 'Rx Sop', 'Morfometria', 'Sala Cpre']);
  const [sopCategories] = useState(['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro']);

  // Meses
  const [myProductionMonth, setMyProductionMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [adminProductionMonth, setAdminProductionMonth] = useState(new Date().toISOString().slice(0, 7));

  // Diálogos
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productionToDelete, setProductionToDelete] = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryDNI, setRecoveryDNI] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({ title: '', message: '', onConfirm: null });
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [promptDialogData, setPromptDialogData] = useState({ title: '', message: '', onConfirm: null });
  const [promptValue, setPromptValue] = useState('');

  // Admin Panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editableItems, setEditableItems] = useState([...['Rx consulta externa', 'Rx consulta externa 2', 'Rx consulta externa 3', 'Rx emergencia', 'Rx hospitalizados', 'Rx especiales', 'Urvi', 'Rx portatil', 'Mamografia', 'Colocacion Arpon', 'Densitometria', 'Rx Sop', 'Morfometria', 'Sala Cpre']]);
  const [newSalaName, setNewSalaName] = useState('');

  // Edición de producción
  const [editingProduction, setEditingProduction] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filtros admin
  const [filterUserDNI, setFilterUserDNI] = useState('');

  // ===== PANEL ADMIN: GESTIÓN DE TECNÓLOGOS =====
  const [showUserManager, setShowUserManager] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ fullname: '', password: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserData, setAddUserData] = useState({ dni: '', fullname: '', password: '', passwordConfirm: '' });

  // Cambio de contraseña propia
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // ===== EFECTOS =====
  useEffect(() => {
    loadData();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) console.log('Usuario autenticado:', user.uid);
    });
    return () => unsubscribe();
  }, []);

  // ===== FUNCIONES AUXILIARES =====
  const showMessage = (message, duration = 3000) => {
    setSuccessMessageText(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), duration);
  };

  // ===== CARGA DE DATOS =====
  const loadData = async () => {
    try {
      const usersData = await getAllUsers();
      if (usersData && usersData.length > 0) {
        const userDNIs = usersData.map(u => u.dni);
        const passwords = {};
        const fullnames = {};
        usersData.forEach(u => {
          passwords[u.dni] = u.password;
          fullnames[u.dni] = u.fullname;
        });
        setUsers(userDNIs);
        setUserPasswords(passwords);
        setUserFullNames(fullnames);
      }
      const salasData = await getSalas();
      if (salasData && salasData.length > 0) setEditableItems(salasData);
      console.log('Datos cargados desde Firebase');
    } catch (e) {
      console.error('Error cargando desde Firebase:', e);
    }
  };

  // ===== LOGIN / LOGOUT =====
  const handleLogin = async () => {
    if (!loginDNI || !loginPassword) {
      showMessage('❌ Por favor completa todos los campos');
      return;
    }
    if (loginPassword === ADMIN_KEY) {
      setIsAdmin(true);
      setCurrentUser(loginDNI);
      setIsLoggedIn(true);
      try {
        const prodsData = await getAllProduction();
        if (prodsData && prodsData.length > 0) setProductions(prodsData);
      } catch (error) { console.error('Error cargando producciones admin:', error); }
      return;
    }
    if (!users.includes(loginDNI)) {
      showMessage('❌ Usuario no encontrado. El DNI no está registrado.', 4000);
      return;
    }
    if (userPasswords[loginDNI] === loginPassword) {
      setCurrentUser(loginDNI);
      setIsLoggedIn(true);
      setIsAdmin(false);
      try {
        const prodsData = await getProductionByUser(loginDNI);
        if (prodsData && prodsData.length > 0) setProductions(prodsData);
      } catch (error) { console.error('Error cargando producciones usuario:', error); }
    } else {
      showMessage('❌ Contraseña incorrecta. Usa "¿Olvidaste tu contraseña?"', 5000);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setIsAdmin(false);
    setLoginDNI('');
    setLoginPassword('');
    setShowAdminPanel(false);
    setShowUserManager(false);
  };

  // ===== REGISTRO PÚBLICO =====
  const handleRegister = async () => {
    if (!newDNI.trim() || !newFullName.trim() || !newPassword || !newPasswordConfirm) {
      showMessage('❌ Por favor completa todos los campos');
      return;
    }
    if (users.includes(newDNI.trim())) {
      showMessage('❌ Este DNI ya está registrado');
      return;
    }
    if (newPassword.length < 4) {
      showMessage('❌ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showMessage('❌ Las contraseñas no coinciden');
      return;
    }
    const userName = newFullName.trim();
    const userDNI = newDNI.trim();
    try {
      await saveUser({ dni: userDNI, fullname: userName, password: newPassword });
      setUsers([...users, userDNI]);
      setUserPasswords({...userPasswords, [userDNI]: newPassword});
      setUserFullNames({...userFullNames, [userDNI]: userName});
      setNewDNI(''); setNewFullName(''); setNewPassword(''); setNewPasswordConfirm('');
      setShowRegister(false);
      showMessage(`¡Usuario registrado!\n👤 ${userName}\n🆔 DNI: ${userDNI}`, 5000);
    } catch (error) {
      showMessage('❌ Error al registrar: ' + error.message);
    }
  };

  // ===== ADMIN: AGREGAR TECNÓLOGO =====
  const handleAdminAddUser = async () => {
    const { dni, fullname, password, passwordConfirm } = addUserData;
    if (!dni.trim() || !fullname.trim() || !password || !passwordConfirm) {
      showMessage('❌ Por favor completa todos los campos');
      return;
    }
    if (users.includes(dni.trim())) {
      showMessage('❌ Este DNI ya está registrado');
      return;
    }
    if (password.length < 4) {
      showMessage('❌ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (password !== passwordConfirm) {
      showMessage('❌ Las contraseñas no coinciden');
      return;
    }
    try {
      await saveUser({ dni: dni.trim(), fullname: fullname.trim(), password });
      setUsers([...users, dni.trim()]);
      setUserPasswords({...userPasswords, [dni.trim()]: password});
      setUserFullNames({...userFullNames, [dni.trim()]: fullname.trim()});
      setAddUserData({ dni: '', fullname: '', password: '', passwordConfirm: '' });
      setShowAddUserModal(false);
      showMessage(`✅ Tecnólogo agregado\n👤 ${fullname.trim()}\n🆔 DNI: ${dni.trim()}`, 4000);
    } catch (error) {
      showMessage('❌ Error al agregar: ' + error.message);
    }
  };

  // ===== ADMIN: EDITAR TECNÓLOGO =====
  const handleAdminEditUser = (dni) => {
    setEditUserData({
      fullname: userFullNames[dni] || '',
      password: userPasswords[dni] || ''
    });
    setEditingUser(dni);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    if (!editUserData.fullname.trim()) {
      showMessage('❌ El nombre no puede estar vacío');
      return;
    }
    if (editUserData.password.length < 4) {
      showMessage('❌ La contraseña debe tener al menos 4 caracteres');
      return;
    }
    try {
      await saveUser({
        dni: editingUser,
        fullname: editUserData.fullname.trim(),
        password: editUserData.password
      });
      setUserFullNames({ ...userFullNames, [editingUser]: editUserData.fullname.trim() });
      setUserPasswords({ ...userPasswords, [editingUser]: editUserData.password });
      setEditingUser(null);
      showMessage('✅ Tecnólogo actualizado correctamente');
    } catch (error) {
      showMessage('❌ Error al actualizar: ' + error.message);
    }
  };

  // ===== ADMIN: ELIMINAR TECNÓLOGO =====
  const handleAdminDeleteUser = (dni) => {
    setConfirmDialogData({
      title: '🗑️ Eliminar Tecnólogo Médico',
      message: `¿Eliminar a ${userFullNames[dni] || dni}?\n\nDNI: ${dni}\n\n⚠️ Esta acción también eliminará TODOS sus registros de producción y no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteUserDB(dni);
          const userProductions = productions.filter(p => p.user === dni);
          for (const prod of userProductions) {
            await deleteProductionDB(prod.id);
          }
          setUsers(users.filter(u => u !== dni));
          const updatedPasswords = { ...userPasswords };
          const updatedNames = { ...userFullNames };
          delete updatedPasswords[dni];
          delete updatedNames[dni];
          setUserPasswords(updatedPasswords);
          setUserFullNames(updatedNames);
          setProductions(productions.filter(p => p.user !== dni));
          showMessage('✅ Tecnólogo eliminado\nSe eliminaron también todos sus registros.', 4000);
        } catch (error) {
          showMessage('❌ Error al eliminar: ' + error.message);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // ===== ADMIN: RESET CONTRASEÑA =====
  const resetUserPassword = (dni) => {
    const userName = userFullNames[dni] || dni;
    setPromptDialogData({
      title: '🔑 Reset de Contraseña',
      message: `Nueva contraseña para ${userName}:\n(Mínimo 4 caracteres)`,
      onConfirm: async (newPass) => {
        if (!newPass || newPass.trim().length === 0) {
          showMessage('❌ La contraseña no puede estar vacía');
          return;
        }
        if (newPass.length < 4) {
          showMessage('❌ La contraseña debe tener al menos 4 caracteres');
          return;
        }
        try {
          await saveUser({ dni, fullname: userFullNames[dni], password: newPass });
          setUserPasswords({...userPasswords, [dni]: newPass});
          showMessage(`✅ Contraseña actualizada\n👤 ${userName}\n🔐 Nueva: ${newPass}`, 6000);
        } catch (error) {
          showMessage('❌ Error: ' + error.message);
        }
      }
    });
    setPromptValue('');
    setShowPromptDialog(true);
  };

  // ===== CAMBIO DE CONTRASEÑA PROPIA =====
  const handleChangePassword = () => {
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      showMessage('❌ Completa todos los campos');
      return;
    }
    if (userPasswords[currentUser] !== changePasswordData.currentPassword) {
      showMessage('❌ La contraseña actual es incorrecta');
      return;
    }
    if (changePasswordData.newPassword.length < 4) {
      showMessage('❌ La nueva contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      showMessage('❌ Las contraseñas no coinciden');
      return;
    }
    saveUser({
      dni: currentUser,
      fullname: userFullNames[currentUser],
      password: changePasswordData.newPassword
    }).then(() => {
      setUserPasswords({ ...userPasswords, [currentUser]: changePasswordData.newPassword });
      setShowChangePassword(false);
      setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('✅ Contraseña cambiada exitosamente');
    }).catch(err => showMessage('❌ Error: ' + err.message));
  };

  // ===== RECUPERACIÓN DE CONTRASEÑA =====
  const handlePasswordRecovery = () => {
    if (!recoveryDNI.trim()) {
      showMessage('❌ Por favor ingresa tu DNI');
      return;
    }
    if (!users.includes(recoveryDNI.trim())) {
      showMessage('❌ DNI no encontrado', 4000);
      return;
    }
    const password = userPasswords[recoveryDNI.trim()];
    showMessage(`🔑 Tu contraseña es: ${password}\n\nPor seguridad, cámbiala después de iniciar sesión.`, 6000);
    setShowRecovery(false);
    setRecoveryDNI('');
  };

  // ===== PRODUCCIÓN =====
  const addProduction = async (date, sala, turno, cantidad, sopCategory = null, rxEspeciales = null, notas = null) => {
    if (sala === 'Rx especiales' && rxEspeciales) {
      try {
        const newProds = rxEspeciales
          .filter(esp => esp.examen.trim() && esp.cantidad)
          .map(esp => ({
            id: Date.now() + Math.random(),
            user: currentUser,
            date,
            sala,
            turno,
            cantidad: parseFloat(esp.cantidad),
            rxEspecialExamen: esp.examen,
            notas: notas || null,
            timestamp: new Date().toISOString()
          }));
        for (const prod of newProds) {
          await addProductionDB(prod);
        }
        setProductions([...productions, ...newProds]);
        alert(`✅ ${newProds.length} examen(es) registrado(s)!`);
        return true;
      } catch (error) {
        alert('❌ Error al registrar: ' + error.message);
        return false;
      }
    }
    const newProd = {
      id: Date.now(),
      user: currentUser,
      date,
      sala,
      turno,
      cantidad: parseFloat(cantidad),
      sopCategory: sopCategory || null,
      notas: notas || null,
      timestamp: new Date().toISOString()
    };
    try {
      await addProductionDB(newProd);
      setProductions([...productions, newProd]);
      alert('✅ Producción registrada!');
      return true;
    } catch (error) {
      alert('❌ Error al registrar: ' + error.message);
      return false;
    }
  };

  const deleteProduction = (id) => {
    setProductionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (productionToDelete) {
      try {
        await deleteProductionDB(productionToDelete);
        setProductions(productions.filter(p => p.id !== productionToDelete));
        showMessage('✅ Registro eliminado!');
      } catch (error) {
        showMessage('❌ Error al eliminar: ' + error.message);
      }
    }
    setShowDeleteDialog(false);
    setProductionToDelete(null);
  };

  const editProduction = (prod) => {
    setEditingProduction({...prod});
    setShowEditDialog(true);
  };

  const saveEditedProduction = async () => {
    if (!editingProduction.sala || !editingProduction.turno || !editingProduction.cantidad) {
      showMessage('❌ Por favor completa todos los campos');
      return;
    }
    try {
      const updatedProd = {...editingProduction, cantidad: Number(editingProduction.cantidad)};
      await updateProductionDB(updatedProd.id, updatedProd);
      setProductions(productions.map(p => p.id === updatedProd.id ? updatedProd : p));
      setShowEditDialog(false);
      setEditingProduction(null);
      showMessage('✅ Producción actualizada!');
    } catch (error) {
      showMessage('❌ Error al actualizar: ' + error.message);
    }
  };

  // ===== SALAS =====
  const addSala = async () => {
    if (!newSalaName.trim()) { alert('Ingresa el nombre de la sala'); return; }
    if (editableItems.includes(newSalaName.trim())) { alert('Esta sala ya existe'); return; }
    try {
      const newSalas = [...editableItems, newSalaName.trim()];
      await saveSalas(newSalas);
      setEditableItems(newSalas);
      setNewSalaName('');
      alert('✅ Sala agregada');
    } catch (error) { alert('❌ Error: ' + error.message); }
  };

  const deleteSala = (sala) => {
    setConfirmDialogData({
      title: '🗑️ Eliminar Sala',
      message: `¿Eliminar sala "${sala}"?\n\nLos registros existentes se mantendrán.`,
      onConfirm: async () => {
        try {
          const newSalas = editableItems.filter(s => s !== sala);
          await saveSalas(newSalas);
          setEditableItems(newSalas);
          showMessage('✅ Sala eliminada');
        } catch (error) { showMessage('❌ Error: ' + error.message); }
      }
    });
    setShowConfirmDialog(true);
  };

  // ===== REPORTES =====
  const getMyProductions = () => {
    return productions
      .filter(p => p.user === currentUser && p.date.startsWith(myProductionMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getAllProductions = () => {
    let filtered = productions.filter(p => p.date.startsWith(adminProductionMonth));
    if (filterUserDNI && filterUserDNI !== 'todos') {
      filtered = filtered.filter(p => p.user === filterUserDNI);
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const generateReport = () => {
    const filtered = productions.filter(p => p.date.startsWith(reportMonth));
    const byUser = {};
    const byTurno = { 'Diurno': 0, 'Mañana': 0, 'Tarde': 0, 'Noche': 0 };
    const bySala = {};
    const bySopCategory = {};
    const byRxEspecial = {};
    editableItems.forEach(item => { bySala[item] = 0; });
    sopCategories.forEach(cat => { bySopCategory[cat] = 0; });
    filtered.forEach(p => {
      if (!byUser[p.user]) {
        byUser[p.user] = { total: 0, horasTrabajadas: 0, turnosPorFecha: {}, turnos: { 'Diurno': 0, 'Mañana': 0, 'Tarde': 0, 'Noche': 0 }, salas: {}, sopCategories: {}, rxEspeciales: {} };
        editableItems.forEach(item => { byUser[p.user].salas[item] = 0; });
        sopCategories.forEach(cat => { byUser[p.user].sopCategories[cat] = 0; });
      }
      const cantidad = Number(p.cantidad) || 0;
      byUser[p.user].total += cantidad;
      if (p.turno && p.date) {
        const fechaTurnoKey = `${p.date}-${p.turno}`;
        if (!byUser[p.user].turnosPorFecha[fechaTurnoKey]) {
          byUser[p.user].turnosPorFecha[fechaTurnoKey] = true;
          if (p.turno === 'Mañana' || p.turno === 'Tarde') byUser[p.user].horasTrabajadas += 6;
          else if (p.turno === 'Diurno' || p.turno === 'Noche') byUser[p.user].horasTrabajadas += 12;
        }
      }
      if (p.turno) {
        byUser[p.user].turnos[p.turno] = (byUser[p.user].turnos[p.turno] || 0) + cantidad;
        byTurno[p.turno] = (byTurno[p.turno] || 0) + cantidad;
      }
      if (p.sala) {
        byUser[p.user].salas[p.sala] = (byUser[p.user].salas[p.sala] || 0) + cantidad;
        bySala[p.sala] = (bySala[p.sala] || 0) + cantidad;
      }
      if (p.sopCategory) {
        byUser[p.user].sopCategories[p.sopCategory] = (byUser[p.user].sopCategories[p.sopCategory] || 0) + cantidad;
        bySopCategory[p.sopCategory] = (bySopCategory[p.sopCategory] || 0) + cantidad;
      }
      if (p.rxEspecialExamen) {
        byRxEspecial[p.rxEspecialExamen] = (byRxEspecial[p.rxEspecialExamen] || 0) + cantidad;
        byUser[p.user].rxEspeciales[p.rxEspecialExamen] = (byUser[p.user].rxEspeciales[p.rxEspecialExamen] || 0) + cantidad;
      }
    });
    const totalGeneral = filtered.reduce((sum, p) => sum + (Number(p.cantidad) || 0), 0);
    return { byUser, totalGeneral, bySala, byTurno, bySopCategory, byRxEspecial, recordCount: filtered.length };
  };

  // ===== EXPORTAR =====
  const exportToTXT = () => {
    const report = generateReport();
    let content = `REPORTE DE PRODUCCION - ${reportMonth}\n`;
    content += `${'='.repeat(60)}\n\n`;
    if (isAdmin) {
      content += `TOTAL GENERAL: ${report.totalGeneral}\n`;
      content += `REGISTROS: ${report.recordCount}\n\n`;
      content += `TOTALES POR TURNO:\n${'-'.repeat(40)}\n`;
      Object.entries(report.byTurno).forEach(([turno, total]) => { content += `${turno}: ${total}\n`; });
      content += `\nTOTALES POR SALA:\n${'-'.repeat(40)}\n`;
      editableItems.forEach(item => { if (report.bySala[item] > 0) content += `${item}: ${report.bySala[item]}\n`; });
      content += `\nTOTALES POR CATEGORIA RX SOP:\n${'-'.repeat(40)}\n`;
      let hasSopData = false;
      sopCategories.forEach(cat => { if (report.bySopCategory[cat] > 0) { content += `${cat}: ${report.bySopCategory[cat]}\n`; hasSopData = true; } });
      if (!hasSopData) content += `(Sin registros de Rx SOP este mes)\n`;
      content += `\nTOTALES DE EXAMENES ESPECIALES:\n${'-'.repeat(40)}\n`;
      const hasRxEspecialData = Object.keys(report.byRxEspecial).length > 0;
      if (hasRxEspecialData) { Object.entries(report.byRxEspecial).forEach(([examen, total]) => { content += `${examen}: ${total}\n`; }); }
      else content += `(Sin examenes especiales registrados este mes)\n`;
    }
    content += `\nDETALLE POR USUARIO:\n${'='.repeat(60)}\n`;
    const usersTo = Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser);
    usersTo.forEach(([user, data]) => {
      content += `\nUsuario: ${userFullNames[user] || user}\nDNI: ${user}\nTotal: ${data.total}\nHoras trabajadas: ${data.horasTrabajadas}h\n`;
      const userSopTotal = Object.values(data.sopCategories).reduce((sum, val) => sum + val, 0);
      if (userSopTotal > 0) {
        content += `Rx SOP por categoria:\n`;
        sopCategories.forEach(cat => { if (data.sopCategories[cat] > 0) content += `  - ${cat}: ${data.sopCategories[cat]}\n`; });
      }
      const userRxEspecialTotal = Object.values(data.rxEspeciales || {}).reduce((sum, val) => sum + val, 0);
      if (userRxEspecialTotal > 0) {
        content += `Examenes Especiales:\n`;
        Object.entries(data.rxEspeciales).forEach(([examen, cantidad]) => { if (cantidad > 0) content += `  - ${examen}: ${cantidad}\n`; });
      }
      content += `${'-'.repeat(40)}\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isAdmin ? `reporte-produccion-${reportMonth}.txt` : `reporte-produccion-${userFullNames[currentUser] || currentUser}-${reportMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('✅ Reporte exportado a TXT');
  };

  const generateCalendarHTML = (userId, userName, targetMonth) => {
    const filtered = productions.filter(p => p.user === userId && p.date.startsWith(targetMonth));
    if (filtered.length === 0) return '';
    const [year, month] = targetMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const matrix = {};
    filtered.forEach(p => {
      const day = parseInt(p.date.split('-')[2]);
      const key = `${p.sala} / ${p.turno}`;
      if (!matrix[key]) matrix[key] = {};
      matrix[key][day] = (matrix[key][day] || 0) + Number(p.cantidad);
    });
    const turnoOrder = { 'Mañana': 1, 'Tarde': 2, 'Diurno': 3, 'Noche': 4 };
    const sortedMatrix = {};
    Object.keys(matrix).sort((a, b) => {
      const turnoA = a.split(' / ')[1];
      const turnoB = b.split(' / ')[1];
      const orderA = turnoOrder[turnoA] || 5;
      const orderB = turnoOrder[turnoB] || 5;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    }).forEach(key => { sortedMatrix[key] = matrix[key]; });
    const dayTotals = {};
    Object.values(sortedMatrix).forEach(dayData => {
      Object.entries(dayData).forEach(([day, cantidad]) => { dayTotals[day] = (dayTotals[day] || 0) + cantidad; });
    });
    const rowTotals = {};
    Object.entries(sortedMatrix).forEach(([key, dayData]) => { rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0); });
    const monthName = new Date(targetMonth + '-15').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    let html = `<div style="page-break-before: always; margin-top: 40px;"><h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">📅 REPORTE CALENDARIO DE PRODUCCION INDIVIDUAL</h2><div style="border-top: 3px solid #0284c7; border-bottom: 3px solid #0284c7; padding: 20px 15px; margin: 20px 0;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px;"><div style="font-size: 15px;"><strong style="color: #0369a1;">Red Asistencial:</strong> Sabogal</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Departamento:</strong> Ayuda al Diagnostico y Tratamiento</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Servicio:</strong> Radiodiagnostico y Ecografia</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Especialidad:</strong> Radiologia</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Cargo:</strong> Tecnologo Medico</div><div style="font-size: 15px;"><strong style="color: #0369a1;">Usuario:</strong> ${userName}</div><div style="font-size: 15px;"><strong style="color: #0369a1;">DNI:</strong> ${userId}</div><div style="font-size: 15px; grid-column: 1 / -1;"><strong style="color: #0369a1;">Mes:</strong> ${monthName}</div></div></div><table style="width: 100%; border-collapse: collapse; font-size: 10px; margin: 20px 0;"><thead><tr><th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px; max-width: 180px;">Sala / Turno</th>`;
    days.forEach(day => { html += `<th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px;">${day}</th>`; });
    html += `<th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px; font-weight: bold;">Total</th></tr></thead><tbody>`;
    Object.entries(sortedMatrix).forEach(([key, dayData]) => {
      html += `<tr><td style="background: #f1f5f9; font-weight: bold; text-align: left; padding: 6px 4px; border: 1px solid #cbd5e1; max-width: 180px; font-size: 9px;">${key}</td>`;
      days.forEach(day => {
        const value = dayData[day] || '';
        const bgColor = value ? '#dcfce7' : '#f9fafb';
        const textColor = value ? '#166534' : '#9ca3af';
        const fontWeight = value ? 'bold' : 'normal';
        html += `<td style="background: ${bgColor}; color: ${textColor}; font-weight: ${fontWeight}; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${value || '-'}</td>`;
      });
      html += `<td style="background: #dbeafe; font-weight: bold; color: #1e40af; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${rowTotals[key]}</td></tr>`;
    });
    html += `<tr><td style="background: #fef3c7; font-weight: bold; color: #92400e; text-align: left; padding: 6px 4px; border: 1px solid #cbd5e1; font-size: 9px;">TOTAL POR DIA</td>`;
    days.forEach(day => { const total = dayTotals[day] || ''; html += `<td style="background: #fef3c7; font-weight: bold; color: #92400e; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${total || '-'}</td>`; });
    const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + val, 0);
    html += `<td style="background: #fef3c7; font-weight: bold; color: #92400e; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px;">${grandTotal}</td></tr></tbody></table></div>`;
    const productionsWithNotes = filtered.filter(p => p.notas && p.notas.trim());
    if (productionsWithNotes.length > 0) {
      html += `<div style="margin-top: 30px; page-break-inside: avoid;"><h3 style="color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 15px;">📝 NOTAS Y OBSERVACIONES</h3><table style="width: 100%; border-collapse: collapse; font-size: 10px;"><thead><tr><th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 15%;">Fecha</th><th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 25%;">Sala</th><th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 12%;">Turno</th><th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 48%;">Observaciones</th></tr></thead><tbody>`;
      productionsWithNotes.forEach(p => {
        html += `<tr><td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.date}</td><td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.sala}</td><td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.turno}</td><td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px; font-style: italic; color: #374151;">${p.notas}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    }
    return html;
  };

  const exportToPDF = () => {
    const report = generateReport();
    const hasSopData = Object.values(report.bySopCategory).some(val => val > 0);
    let content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte de Produccion - ${reportMonth}</title><style>@media print { body { margin: 0; } .no-print { display: none; } } body { font-family: Arial, sans-serif; padding: 30px; background: white; } h1 { color: #4F46E5; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; margin-bottom: 20px; } h2 { color: #7C3AED; margin-top: 30px; border-bottom: 2px solid #E9D5FF; padding-bottom: 5px; page-break-after: avoid; } .summary { background: #EEF2FF; padding: 15px; border-radius: 8px; margin: 20px 0; display: flex; gap: 30px; } .user-section { background: #F9FAFB; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; page-break-inside: avoid; } table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: avoid; } th { background: #4F46E5; color: white; padding: 10px; text-align: left; font-weight: bold; } td { padding: 8px; border-bottom: 1px solid #E5E7EB; } tr:nth-child(even) { background: #F9FAFB; } .stat { flex: 1; } .stat-label { color: #6B7280; font-size: 14px; margin-bottom: 5px; } .stat-value { color: #1F2937; font-size: 24px; font-weight: bold; } .sop-section { background: #FEF3C7; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #F59E0B; } .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 12px; text-align: center; } .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #EF4444; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; } .print-button:hover { background: #DC2626; } @media print { .print-button { display: none; } }</style></head><body><button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>`;
    if (isAdmin) {
      content += `<h1>📊 Reporte de Produccion General - ${reportMonth}</h1><div class="summary"><div class="stat"><div class="stat-label">Total General</div><div class="stat-value">${report.totalGeneral}</div></div><div class="stat"><div class="stat-label">Total de Registros</div><div class="stat-value">${report.recordCount}</div></div><div class="stat"><div class="stat-label">Usuarios Activos</div><div class="stat-value">${Object.keys(report.byUser).length}</div></div></div><h2>📅 Totales por Turno</h2><table><tr><th>Turno</th><th>Total</th><th>Porcentaje</th></tr>${Object.entries(report.byTurno).map(([turno, total]) => `<tr><td><strong>${turno}</strong></td><td><strong>${total}</strong></td><td>${report.totalGeneral > 0 ? ((total / report.totalGeneral) * 100).toFixed(1) : 0}%</td></tr>`).join('')}</table><h2>🏥 Totales por Sala</h2><table><tr><th>Sala</th><th>Total</th><th>Porcentaje</th></tr>${editableItems.filter(item => report.bySala[item] > 0).map(item => `<tr><td>${item}</td><td><strong>${report.bySala[item]}</strong></td><td>${report.totalGeneral > 0 ? ((report.bySala[item] / report.totalGeneral) * 100).toFixed(1) : 0}%</td></tr>`).join('')}</table>${hasSopData ? `<h2>🔬 Totales por Categoria Rx SOP</h2><table><tr><th>Categoria</th><th>Total</th></tr>${sopCategories.filter(cat => report.bySopCategory[cat] > 0).map(cat => `<tr><td>${cat}</td><td><strong>${report.bySopCategory[cat]}</strong></td></tr>`).join('')}</table>` : ''}${Object.keys(report.byRxEspecial).length > 0 ? `<h2>🔬 Totales de Examenes Especiales</h2><table><tr><th>Examen</th><th>Total</th></tr>${Object.entries(report.byRxEspecial).map(([examen, total]) => `<tr><td>${examen}</td><td><strong>${total}</strong></td></tr>`).join('')}</table>` : ''}<h2>👥 Resumen por Usuario</h2>${Object.entries(report.byUser).map(([user, data]) => { const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0); return `<div class="user-section"><h3>👤 ${userFullNames[user] || user}</h3><table style="margin: 10px 0;"><tr><th>Total</th><th>Horas Trabajadas</th><th>Promedio/Hora</th></tr><tr><td><strong>${data.total}</strong></td><td><strong>${data.horasTrabajadas}h</strong></td><td><strong>${data.horasTrabajadas > 0 ? (data.total / data.horasTrabajadas).toFixed(2) : 0}</strong></td></tr></table>${userSopTotal > 0 ? `<div class="sop-section"><strong>🔬 Rx SOP por categoria:</strong><br><br><table><tr><th>Categoria</th><th>Cantidad</th></tr>${sopCategories.filter(cat => data.sopCategories[cat] > 0).map(cat => `<tr><td>${cat}</td><td><strong>${data.sopCategories[cat]}</strong></td></tr>`).join('')}</table></div>` : ''}${Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 ? `<div class="sop-section" style="background: #DBEAFE; border-left: 4px solid #3B82F6;"><strong>🔬 Examenes Especiales:</strong><br><br><table><tr><th>Examen</th><th>Cantidad</th></tr>${Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => `<tr><td>${examen}</td><td><strong>${cantidad}</strong></td></tr>`).join('')}</table></div>` : ''}</div>`; }).join('')}`;
      Object.keys(report.byUser).forEach(user => {
        const calHtml = generateCalendarHTML(user, userFullNames[user] || user, reportMonth);
        if (calHtml) content += calHtml;
      });
    } else {
      const userName = userFullNames[currentUser] || currentUser;
      const calHtml = generateCalendarHTML(currentUser, userName, reportMonth);
      if (calHtml) content += calHtml;
      else content += `<div style="padding: 40px; text-align: center;"><h2 style="color: #DC2626;">⚠️ Sin datos</h2><p style="color: #6B7280;">No hay registros de produccion para este mes.</p></div>`;
    }
    content += `<div class="footer"><p><strong>Sistema de Produccion Diaria - EsSalud</strong></p><p>Reporte generado el ${new Date().toLocaleString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div></body></html>`;
    try {
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isAdmin ? `reporte-produccion-completo-${reportMonth}.html` : `reporte-calendario-${userFullNames[currentUser] || currentUser}-${reportMonth}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) { console.error('Error al exportar:', error); alert('❌ Error al exportar: ' + error.message); }
  };

  // ===== RENDER: LOGIN =====
  if (!isLoggedIn) {
    if (showRecovery) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🔑 Recuperar Contraseña</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">DNI</label><input type="text" value={recoveryDNI} onChange={(e) => setRecoveryDNI(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handlePasswordRecovery()} placeholder="Ingresa tu DNI" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowRecovery(false); setRecoveryDNI(''); }} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
                <button onClick={handlePasswordRecovery} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Recuperar</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (showRegister) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Usuario</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Nombre y apellido" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">DNI</label><input type="text" value={newDNI} onChange={(e) => setNewDNI(e.target.value)} placeholder="Ingresa tu DNI" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><div className="relative"><input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 4 caracteres" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-12" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl">{showNewPassword ? '🙈' : '👁️'}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label><input type={showNewPassword ? "text" : "password"} value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleRegister()} placeholder="Repite tu contraseña" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowRegister(false); setNewDNI(''); setNewFullName(''); setNewPassword(''); setNewPasswordConfirm(''); }} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
                <button onClick={handleRegister} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {showSuccessMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50" style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div className={`${successMessageText.includes('❌') ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{successMessageText.includes('❌') ? '❌' : '✅'}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{successMessageText.includes('❌') ? '¡Error!' : successMessageText.includes('🔑') ? 'Recuperacion' : '¡Exito!'}</div>
                  <div className="text-sm whitespace-pre-line">{successMessageText}</div>
                </div>
                <button onClick={() => setShowSuccessMessage(false)} className="text-white hover:text-gray-200 text-xl font-bold">×</button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <TrendingUp className="text-indigo-600 mx-auto mb-4" size={48} />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Produccion Diaria</h1>
            <p className="text-gray-600">Inicia sesion para continuar</p>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">DNI</label><input type="text" value={loginDNI} onChange={(e) => setLoginDNI(e.target.value)} placeholder="Ingresa tu DNI" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><div className="relative"><input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Ingresa tu contraseña" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl">{showPassword ? '🙈' : '👁️'}</button></div></div>
            <button onClick={handleLogin} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg">Iniciar Sesion</button>
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">¿Primera vez aqui?</span></div></div>
            <button onClick={() => setShowRegister(true)} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2"><Plus size={20} />Crear Nueva Cuenta</button>
            <button onClick={() => setShowRecovery(true)} className="w-full px-4 py-2 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm">¿Olvidaste tu contraseña?</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: APLICACIÓN PRINCIPAL =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Mensaje de Éxito/Error */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50" style={{animation: 'fadeIn 0.3s ease-out'}}>
          <div className={`${successMessageText.includes('❌') ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{successMessageText.includes('❌') ? '❌' : successMessageText.includes('🔑') ? '🔑' : '✅'}</div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">{successMessageText.includes('❌') ? '¡Error!' : successMessageText.includes('🔑') ? 'Informacion' : '¡Exito!'}</div>
                <div className="text-sm whitespace-pre-line">{successMessageText}</div>
              </div>
              <button onClick={() => setShowSuccessMessage(false)} className="text-white hover:text-gray-200 text-xl font-bold">×</button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{confirmDialogData.title}</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{confirmDialogData.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDialog(false)} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
              <button onClick={() => { setShowConfirmDialog(false); confirmDialogData.onConfirm?.(); }} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Prompt */}
      {showPromptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{promptDialogData.title}</h3>
            <p className="text-gray-600 mb-4 whitespace-pre-line">{promptDialogData.message}</p>
            <input type="text" value={promptValue} onChange={(e) => setPromptValue(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { setShowPromptDialog(false); promptDialogData.onConfirm?.(promptValue); } }} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="Ingresa la contraseña..." autoFocus />
            <div className="flex gap-3">
              <button onClick={() => { setShowPromptDialog(false); setPromptValue(''); }} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
              <button onClick={() => { setShowPromptDialog(false); promptDialogData.onConfirm?.(promptValue); }} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Producción */}
      {showEditDialog && editingProduction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Producción</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input type="date" value={editingProduction.date} onChange={(e) => setEditingProduction({...editingProduction, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sala</label><select value={editingProduction.sala} onChange={(e) => setEditingProduction({...editingProduction, sala: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Seleccionar sala</option>{editableItems.map(item => (<option key={item} value={item}>{item}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Turno</label><select value={editingProduction.turno} onChange={(e) => setEditingProduction({...editingProduction, turno: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Seleccionar turno</option><option value="Diurno">Diurno</option><option value="Mañana">Mañana</option><option value="Tarde">Tarde</option><option value="Noche">Noche</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label><input type="number" value={editingProduction.cantidad} onChange={(e) => setEditingProduction({...editingProduction, cantidad: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              {editingProduction.rxEspecialExamen && <div><label className="block text-sm font-medium text-gray-700 mb-1">Examen Especial</label><input type="text" value={editingProduction.rxEspecialExamen} onChange={(e) => setEditingProduction({...editingProduction, rxEspecialExamen: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>}
              {editingProduction.sopCategory && <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría SOP</label><select value={editingProduction.sopCategory} onChange={(e) => setEditingProduction({...editingProduction, sopCategory: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Seleccionar categoría</option>{sopCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditDialog(false); setEditingProduction(null); }} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
              <button onClick={saveEditedProduction} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Eliminar Producción */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Eliminar registro?</h3>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteDialog(false)} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Contraseña Propia */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🔑 Cambiar Contraseña</h3>
            <div className="mb-4"><label className="block text-sm font-medium mb-2">Contraseña Actual</label><input type="password" value={changePasswordData.currentPassword} onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Contraseña actual" /></div>
            <div className="mb-4"><label className="block text-sm font-medium mb-2">Nueva Contraseña</label><input type="password" value={changePasswordData.newPassword} onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Mínimo 4 caracteres" /></div>
            <div className="mb-4"><label className="block text-sm font-medium mb-2">Confirmar Nueva Contraseña</label><input type="password" value={changePasswordData.confirmPassword} onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Repite la nueva contraseña" /></div>
            <div className="flex gap-2">
              <button onClick={handleChangePassword} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Cambiar</button>
              <button onClick={() => { setShowChangePassword(false); setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sistema de Producción Diaria</h1>
              <p className="text-sm text-gray-600">
                Bienvenido, <span className="font-semibold text-indigo-600">{userFullNames[currentUser] || currentUser}</span>
                {isAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">(Admin)</span>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <>
                  <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-bold">
                    ⚙️ Panel Admin
                  </button>
                  <button onClick={() => setShowUserManager(!showUserManager)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold flex items-center gap-1">
                    <UserCog size={16} /> Gestión Tecnólogos
                  </button>
                </>
              )}
              <button onClick={() => setShowChangePassword(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold">
                🔑 Cambiar Contraseña
              </button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-bold">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>

          {/* ===== PANEL: GESTIÓN DE TECNÓLOGOS MÉDICOS ===== */}
          {showUserManager && isAdmin && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UserCog size={24} className="text-blue-600" />
                  Gestión de Tecnólogos Médicos
                </h2>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-bold flex items-center gap-2"
                >
                  <UserPlus size={16} /> Agregar Tecnólogo
                </button>
              </div>

              {/* Tabla de Tecnólogos */}
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="px-4 py-3 text-left">DNI</th>
                        <th className="px-4 py-3 text-left">Nombre Completo</th>
                        <th className="px-4 py-3 text-left">Contraseña</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No hay tecnólogos registrados</td></tr>
                      ) : (
                        users.map((user, index) => (
                          <tr key={user} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-blue-50 transition`}>
                            <td className="px-4 py-3 font-mono text-gray-700">{user}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{userFullNames[user] || 'Sin nombre'}</td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{userPasswords[user] ? '••••••' : 'Sin contraseña'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 justify-center">
                                <button 
                                  onClick={() => handleAdminEditUser(user)}
                                  className="px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition text-xs flex items-center gap-1"
                                  title="Editar tecnólogo"
                                >
                                  <Edit3 size={12} /> Editar
                                </button>
                                <button 
                                  onClick={() => resetUserPassword(user)}
                                  className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-xs flex items-center gap-1"
                                  title="Resetear contraseña"
                                >
                                  <KeyRound size={12} /> Reset
                                </button>
                                <button 
                                  onClick={() => handleAdminDeleteUser(user)}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs flex items-center gap-1"
                                  title="Eliminar tecnólogo"
                                >
                                  <Trash2 size={12} /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-600">
                  Total de tecnólogos registrados: <strong>{users.length}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ===== MODAL: AGREGAR TECNÓLOGO ===== */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <UserPlus size={20} className="text-green-600" />
                    Agregar Nuevo Tecnólogo
                  </h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <input 
                      type="text" 
                      value={addUserData.dni} 
                      onChange={(e) => setAddUserData({...addUserData, dni: e.target.value})}
                      placeholder="Ingresa el DNI" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={addUserData.fullname} 
                      onChange={(e) => setAddUserData({...addUserData, fullname: e.target.value})}
                      placeholder="Nombre y apellidos" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      value={addUserData.password} 
                      onChange={(e) => setAddUserData({...addUserData, password: e.target.value})}
                      placeholder="Mínimo 4 caracteres" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      value={addUserData.passwordConfirm} 
                      onChange={(e) => setAddUserData({...addUserData, passwordConfirm: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminAddUser()}
                      placeholder="Repite la contraseña" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddUserModal(false)} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">
                    Cancelar
                  </button>
                  <button onClick={handleAdminAddUser} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2">
                    <Check size={16} /> Guardar Tecnólogo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== MODAL: EDITAR TECNÓLOGO ===== */}
          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit3 size={20} className="text-amber-600" />
                    Editar Tecnólogo: {editingUser}
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <input 
                      type="text" 
                      value={editingUser} 
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={editUserData.fullname} 
                      onChange={(e) => setEditUserData({...editUserData, fullname: e.target.value})}
                      placeholder="Nombre y apellidos" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <input 
                      type="text" 
                      value={editUserData.password} 
                      onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                      placeholder="Mínimo 4 caracteres" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dejar visible para poder copiar y compartir al usuario</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold">
                    Cancelar
                  </button>
                  <button onClick={handleSaveUserEdit} className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold flex items-center justify-center gap-2">
                    <Check size={16} /> Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== PANEL ADMIN ORIGINAL: SALAS ===== */}
          {showAdminPanel && isAdmin && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Panel de Administración - Salas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">🏥 Gestión de Salas</h3>
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input type="text" value={newSalaName} onChange={(e) => setNewSalaName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSala()} placeholder="Nueva sala" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      <button onClick={addSala} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">+ Agregar</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {editableItems.map(sala => (
                      <div key={sala} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{sala}</span>
                        <button onClick={() => deleteSala(sala)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PANEL ADMIN: GESTIÓN DE PRODUCCIÓN DE TODOS ===== */}
          {showAdminPanel && isAdmin && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-cyan-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Gestión de Producción de Todos los Usuarios</h2>
              <div className="flex gap-3 mb-4">
                <button onClick={() => { if (!filterUserDNI) { alert('Selecciona un usuario específico'); return; } exportAdminIndividualPDF(filterUserDNI, adminProductionMonth); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">📄 Exportar Individual</button>
                <button onClick={() => exportAdminGeneralPDF(adminProductionMonth)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold">📊 Exportar General</button>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Mes</label><input type="month" value={adminProductionMonth} onChange={(e) => setAdminProductionMonth(e.target.value)} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Usuario</label><select value={filterUserDNI} onChange={(e) => setFilterUserDNI(e.target.value)} className="w-full px-4 py-2 border border-cyan-200 rounded-lg"><option value="">Todos los usuarios</option>{users.map(user => (<option key={user} value={user}>{userFullNames[user] || user}</option>))}</select></div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {getAllProductions().length > 0 ? (
                    <div className="space-y-2">
                      {getAllProductions().map(prod => (
                        <div key={prod.id} className="border border-cyan-200 rounded-lg p-3 hover:bg-cyan-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-cyan-800">👤 {userFullNames[prod.user] || prod.user}</div>
                              <div className="text-sm font-semibold text-gray-700">📅 {prod.date.split('-').reverse().join('/')} - {prod.turno}</div>
                              <div className="text-sm text-gray-600">🏥 {prod.sala}</div>
                              {prod.rxEspecialExamen && <div className="text-xs text-blue-600">🔬 Examen: {prod.rxEspecialExamen}</div>}
                              {prod.sopCategory && <div className="text-xs text-orange-600">🏥 Categoría: {prod.sopCategory}</div>}
                              <div className="text-lg font-bold text-cyan-700">Cantidad: {prod.cantidad}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editProduction(prod)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">✏️ Editar</button>
                              <button onClick={() => deleteProduction(prod.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">🗑️ Eliminar</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-cyan-100 rounded-lg">
                        <div className="text-sm font-semibold text-cyan-800">Total: {getAllProductions().reduce((sum, p) => sum + Number(p.cantidad), 0)}</div>
                        <div className="text-xs text-cyan-600">{getAllProductions().length} registro(s){filterUserDNI && ` - ${userFullNames[filterUserDNI] || filterUserDNI}`}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay registros para este mes/usuario</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== FORMULARIO DE PRODUCCIÓN (SOLO NO-ADMIN) ===== */}
          {!isAdmin && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Registrar Producción</h2>
              <ProductionForm 
                currentUser={userFullNames[currentUser] || currentUser}
                items={editableItems}
                sopCategories={sopCategories}
                onSubmit={addProduction}
              />
            </div>
          )}

          {/* ===== MI PRODUCCIÓN (SOLO NO-ADMIN) ===== */}
          {!isAdmin && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Mi Producción del Mes</h2>
              <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Mes</label><input type="month" value={myProductionMonth} onChange={(e) => setMyProductionMonth(e.target.value)} className="px-4 py-2 border border-purple-200 rounded-lg" /></div>
              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                {getMyProductions().length > 0 ? (
                  <div className="space-y-2">
                    {getMyProductions().map(prod => (
                      <div key={prod.id} className="border border-purple-200 rounded-lg p-3 hover:bg-purple-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-700">{prod.date.split('-').reverse().join('/')} - {prod.turno}</div>
                            <div className="text-sm text-gray-600">{prod.sala}</div>
                            {prod.rxEspecialExamen && <div className="text-xs text-blue-600">Examen: {prod.rxEspecialExamen}</div>}
                            {prod.sopCategory && <div className="text-xs text-orange-600">Categoría: {prod.sopCategory}</div>}
                            <div className="text-lg font-bold text-purple-700">Cantidad: {prod.cantidad}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => editProduction(prod)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">✏️ Editar</button>
                            <button onClick={() => deleteProduction(prod.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">🗑️ Eliminar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <div className="text-sm font-semibold text-purple-800">Total: {getMyProductions().reduce((sum, p) => sum + Number(p.cantidad), 0)}</div>
                      <div className="text-xs text-purple-600">{getMyProductions().length} registro(s)</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay registros para este mes</p>
                )}
              </div>
            </div>
          )}

          {/* ===== REPORTE MENSUAL ===== */}
          <ReportSection 
            reportMonth={reportMonth}
            setReportMonth={setReportMonth}
            report={generateReport()}
            userFullNames={userFullNames}
            items={editableItems}
            exportToTXT={exportToTXT}
            exportToPDF={exportToPDF}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE: FORMULARIO DE PRODUCCIÓN =====
function ProductionForm({ currentUser, items, sopCategories, onSubmit }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sala, setSala] = useState('');
  const [turno, setTurno] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [sopCategory, setSopCategory] = useState('');
  const [productionNotes, setProductionNotes] = useState('');
  const [rxEspeciales, setRxEspeciales] = useState([
    { examen: '', cantidad: '' },
    { examen: '', cantidad: '' },
    { examen: '', cantidad: '' }
  ]);

  const handleSubmit = () => {
    if (!sala || !turno) { alert('Por favor completa sala y turno'); return; }
    if (sala === 'Rx Sop' && !sopCategory) { alert('Por favor selecciona una categoría de Rx SOP'); return; }
    if (sala === 'Rx especiales') {
      const hasValid = rxEspeciales.some(esp => esp.examen.trim() && esp.cantidad);
      if (!hasValid) { alert('Por favor ingresa al menos un examen especial'); return; }
      const success = onSubmit(date, sala, turno, 0, null, rxEspeciales, productionNotes);
      if (success) { setSala(''); setTurno(''); setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]); setProductionNotes(''); }
      return;
    }
    if (!cantidad) { alert('Por favor ingresa la cantidad'); return; }
    const success = onSubmit(date, sala, turno, cantidad, sopCategory, null, productionNotes);
    if (success) { setSala(''); setTurno(''); setCantidad(''); setSopCategory(''); setProductionNotes(''); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label><input type="text" value={currentUser} disabled className="w-full px-4 py-2 border border-green-200 rounded-lg bg-gray-100 text-gray-700 font-semibold" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-green-200 rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Sala</label><select value={sala} onChange={(e) => { setSala(e.target.value); setSopCategory(''); setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]); }} className="w-full px-4 py-2 border border-green-200 rounded-lg"><option value="">Seleccionar sala</option>{items.map(item => (<option key={item} value={item}>{item}</option>))}</select></div>
        {sala === 'Rx Sop' && (
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría Rx SOP</label><select value={sopCategory} onChange={(e) => setSopCategory(e.target.value)} className="w-full px-4 py-2 border border-green-200 rounded-lg"><option value="">Seleccionar categoría</option>{sopCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
        )}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Turno</label><select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full px-4 py-2 border border-green-200 rounded-lg"><option value="">Seleccionar turno</option><option value="Diurno">Diurno</option><option value="Mañana">Mañana</option><option value="Tarde">Tarde</option><option value="Noche">Noche</option></select></div>
        {sala !== 'Rx especiales' && (
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label><input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-green-200 rounded-lg" /></div>
        )}
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">📝 Notas / Observaciones (opcional)</label><textarea value={productionNotes} onChange={(e) => setProductionNotes(e.target.value)} placeholder="Ej: Paciente pediatrico, urgencia, estudio especial..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="2" /></div>
      {sala === 'Rx especiales' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Exámenes Especiales Realizados</h3>
          {rxEspeciales.map((esp, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Examen {index + 1}</label><input type="text" value={esp.examen} onChange={(e) => { const newEsp = [...rxEspeciales]; newEsp[index].examen = e.target.value; setRxEspeciales(newEsp); }} placeholder="Nombre del examen" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label><input type="number" value={esp.cantidad} onChange={(e) => { const newEsp = [...rxEspeciales]; newEsp[index].cantidad = e.target.value; setRxEspeciales(newEsp); }} placeholder="0" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" /></div>
            </div>
          ))}
        </div>
      )}
      <button onClick={handleSubmit} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">Registrar Producción</button>
    </div>
  );
}

// ===== COMPONENTE: REPORTE MENSUAL =====
function ReportSection({ reportMonth, setReportMonth, report, userFullNames, items, exportToTXT, exportToPDF, isAdmin, currentUser }) {
  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Reporte Mensual</h2>
        <div className="flex gap-2">
          <button onClick={exportToTXT} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">📄 Exportar TXT</button>
          <button onClick={exportToPDF} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">📑 Exportar PDF</button>
        </div>
      </div>
      <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Mes</label><input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="px-4 py-2 border border-purple-200 rounded-lg" /></div>
      <div className="bg-white rounded-lg p-4">
        <div className="mb-4 p-4 bg-purple-100 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">{report.totalGeneral}</div>
          <div className="text-sm text-purple-600">Total General ({report.recordCount} registros)</div>
        </div>
        <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold text-gray-800 mb-3">Totales por Turno</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg text-center"><div className="text-xs text-gray-600 mb-1">Diurno</div><div className="text-xl font-bold text-green-700">{report.byTurno.Diurno}</div></div>
            <div className="p-3 bg-white rounded-lg text-center"><div className="text-xs text-gray-600 mb-1">Mañana</div><div className="text-xl font-bold text-blue-700">{report.byTurno.Mañana}</div></div>
            <div className="p-3 bg-white rounded-lg text-center"><div className="text-xs text-gray-600 mb-1">Tarde</div><div className="text-xl font-bold text-orange-700">{report.byTurno.Tarde}</div></div>
            <div className="p-3 bg-white rounded-lg text-center"><div className="text-xs text-gray-600 mb-1">Noche</div><div className="text-xl font-bold text-indigo-700">{report.byTurno.Noche}</div></div>
          </div>
        </div>
        <div className="mb-6 p-4 border-2 border-purple-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Totales por Sala</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {items.map(item => (report.bySala[item] > 0 && (
              <div key={item} className="p-2 bg-purple-50 rounded"><div className="text-xs text-gray-600">{item}</div><div className="font-semibold text-purple-700">{report.bySala[item]}</div></div>
            )))}
          </div>
        </div>
        {Object.values(report.bySopCategory).some(val => val > 0) && (
          <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <h3 className="font-semibold text-gray-800 mb-3">🏥 Totales por Categoría Rx SOP</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (report.bySopCategory[cat] > 0 && (
                <div key={cat} className="p-2 bg-white rounded border border-orange-200"><div className="text-xs text-gray-600">{cat}</div><div className="font-semibold text-orange-700">{report.bySopCategory[cat]}</div></div>
              )))}
            </div>
          </div>
        )}
        {Object.keys(report.byRxEspecial).length > 0 && (
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-3">🔬 Totales de Exámenes Especiales</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(report.byRxEspecial).map(([examen, total]) => (
                <div key={examen} className="p-2 bg-white rounded border border-blue-200"><div className="text-xs text-gray-600">{examen}</div><div className="font-semibold text-blue-700">{total}</div></div>
              ))}
            </div>
          </div>
        )}
        <h3 className="font-semibold text-gray-800 mb-3">Detalle por Usuario</h3>
        {Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser).map(([user, data]) => {
          const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0);
          return (
            <div key={user} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-800 mb-2">{userFullNames[user] || user}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-600">Total</div><div className="font-semibold text-gray-800">{data.total}</div></div>
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-600">Horas trabajadas</div><div className="font-semibold text-gray-800">{data.horasTrabajadas}h</div></div>
                <div className="p-2 bg-gray-50 rounded"><div className="text-xs text-gray-600">Promedio/hora</div><div className="font-semibold text-gray-800">{data.horasTrabajadas > 0 ? (data.total / data.horasTrabajadas).toFixed(2) : 0}</div></div>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded"><div className="text-gray-600">Diurno</div><div className="font-semibold text-green-700">{data.turnos.Diurno}</div></div>
                <div className="p-2 bg-blue-50 rounded"><div className="text-gray-600">Mañana</div><div className="font-semibold text-blue-700">{data.turnos.Mañana}</div></div>
                <div className="p-2 bg-orange-50 rounded"><div className="text-gray-600">Tarde</div><div className="font-semibold text-orange-700">{data.turnos.Tarde}</div></div>
                <div className="p-2 bg-indigo-50 rounded"><div className="text-gray-600">Noche</div><div className="font-semibold text-indigo-700">{data.turnos.Noche}</div></div>
              </div>
              {userSopTotal > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs font-semibold text-orange-800 mb-2">🏥 Rx SOP por categoría:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (data.sopCategories[cat] > 0 && (
                      <div key={cat} className="flex justify-between items-center"><span className="text-gray-600">{cat}:</span><span className="font-semibold text-orange-700">{data.sopCategories[cat]}</span></div>
                    )))}
                  </div>
                </div>
              )}
              {Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-semibold text-blue-800 mb-2">🔬 Exámenes Especiales:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => (
                      <div key={examen} className="flex justify-between items-center"><span className="text-gray-600">{examen}:</span><span className="font-semibold text-blue-700">{cantidad}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser).length === 0 && (
          <p className="text-gray-500 text-center py-4">No hay datos para este mes</p>
        )}
      </div>
    </div>
  );
}

// ===== FUNCIONES DE EXPORTACIÓN ADMIN =====
function exportAdminIndividualPDF(userId, targetMonth) {
  // Esta función se define dentro del componente principal
  // Se mantiene como referencia para compatibilidad
}

function exportAdminGeneralPDF(targetMonth) {
  // Esta función se define dentro del componente principal
  // Se mantiene como referencia para compatibilidad
}
