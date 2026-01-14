// IMPORTS DE FIREBASE - ACTIVOS
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
  saveSalas,
  createErrorReport,
  getAllErrorReports,
  getReportsByUser,
  getPendingReports,
  updateErrorReport,
  validateErrorReport,
  getReportsByMonth
} from './services/dbService';


import React, { useState, useEffect } from 'react';
  import { TrendingUp, Plus } from 'lucide-react';
  
     const ADMIN_KEY = 'Essalud2025*';
           
    function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loginDNI, setLoginDNI] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [users, setUsers] = useState([]);
    const [userPasswords, setUserPasswords] = useState({});
    const [userFullNames, setUserFullNames] = useState({});
    const [showRegister, setShowRegister] = useState(false);
    const [productionNotes, setProductionNotes] = useState('');
    const [newDNI, setNewDNI] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [productions, setProductions] = useState([]);
    const [items] = useState(['Rx consulta externa', 'Rx consulta externa 2', 'Rx consulta externa 3', 'Rx emergencia', 'Rx hospitalizados', 'Rx especiales', 'Urvi', 'Rx portatil', 'Mamografia', 'Colocacion Arpon', 'Densitometria', 'Rx Sop', 'Morfometria', 'Sala Cpre']);
    const [sopCategories] = useState(['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro']);
    const [myProductionMonth, setMyProductionMonth] = useState(new Date().toISOString().slice(0, 7));
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productionToDelete, setProductionToDelete] = useState(null);
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryDNI, setRecoveryDNI] = useState('');
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [editableItems, setEditableItems] = useState([...['Rx consulta externa', 'Rx consulta externa 2', 'Rx consulta externa 3', 'Rx emergencia', 'Rx hospitalizados', 'Rx especiales', 'Urvi', 'Rx portatil', 'Mamografia', 'Colocacion Arpon', 'Densitometria', 'Rx Sop', 'Morfometria', 'Sala Cpre']]);
    const [newSalaName, setNewSalaName] = useState('');
    const [editingProduction, setEditingProduction] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessageText, setSuccessMessageText] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogData, setConfirmDialogData] = useState({ title: '', message: '', onConfirm: null });
    const [showPromptDialog, setShowPromptDialog] = useState(false);
    const [promptDialogData, setPromptDialogData] = useState({ title: '', message: '', onConfirm: null });
    const [promptValue, setPromptValue] = useState('');
    const [showAllProductions, setShowAllProductions] = useState(false);
    const [adminProductionMonth, setAdminProductionMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterUserDNI, setFilterUserDNI] = useState(''); // Filtro por usuario
    const [changePasswordData, setChangePasswordData] = useState({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const [showChangePassword, setShowChangePassword] = useState(false);
    
// Estados para sistema de reportes de errores
const [showErrorReportForm, setShowErrorReportForm] = useState(false);
const [showMyReports, setShowMyReports] = useState(false);
const [showAdminReports, setShowAdminReports] = useState(false);
const [errorReports, setErrorReports] = useState([]);
const [pendingReportsCount, setPendingReportsCount] = useState(0);

// Estados del formulario de reporte
const [reportPatientDNI, setReportPatientDNI] = useState('');
const [reportPatientName, setReportPatientName] = useState('');
const [reportExamDate, setReportExamDate] = useState(new Date().toISOString().split('T')[0]);
const [reportExamTime, setReportExamTime] = useState('');
const [reportExamType, setReportExamType] = useState('');
const [reportErrorType, setReportErrorType] = useState('');
const [reportErrorDescription, setReportErrorDescription] = useState('');
const [reportRequestedAction, setReportRequestedAction] = useState('');
const [showReportPreview, setShowReportPreview] = useState(false);
const [previewReport, setPreviewReport] = useState(null);
      
const [editingUser, setEditingUser] = useState(null);
const [editUserData, setEditUserData] = useState({ fullname: '', password: '' });
// Función helper para mostrar mensajes
const showMessage = (message, duration = 3000) => {
      setSuccessMessageText(message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), duration);
    };
    
const loadErrorReports = async () => {
  try {
    if (isAdmin) {
      const reports = await getAllErrorReports();
      setErrorReports(reports);
      const pending = await getPendingReports();
      setPendingReportsCount(pending.length);
    } else {
      const reports = await getReportsByUser(currentUser);
      setErrorReports(reports);
    }
  } catch (error) {
    console.error('Error cargando reportes:', error);
  }
};   

useEffect(() => {
  loadData();

   // ==================== FUNCIONES DE REPORTES DE ERRORES ====================



const handleCreateErrorReport = async () => {
  // Validaciones
  if (!reportPatientDNI || !reportPatientName) {
    showMessage('❌ Por favor completa DNI y nombre del paciente');
    return;
  }
  
  if (!reportExamDate || !reportExamTime || !reportExamType) {
    showMessage('❌ Por favor completa todos los datos del examen');
    return;
  }
  
  if (!reportErrorType || !reportErrorDescription || !reportRequestedAction) {
    showMessage('❌ Por favor completa la descripción del error y solicitud');
    return;
  }
  
  // Crear objeto de previsualización
  const report = {
    patientDNI: reportPatientDNI,
    patientName: reportPatientName,
    examDate: reportExamDate,
    examTime: reportExamTime,
    examType: reportExamType,
    errorType: reportErrorType,
    errorDescription: reportErrorDescription,
    requestedAction: reportRequestedAction,
    reportedBy: currentUser,
    reportedByName: userFullNames[currentUser]
  };
  
  setPreviewReport(report);
  setShowReportPreview(true);
};

const confirmSendErrorReport = async () => {
  try {
    await createErrorReport(previewReport);
    showMessage('✅ Reporte enviado correctamente');
    
    // Limpiar formulario
    setReportPatientDNI('');
    setReportPatientName('');
    setReportExamDate(new Date().toISOString().split('T')[0]);
    setReportExamTime('');
    setReportExamType('');
    setReportErrorType('');
    setReportErrorDescription('');
    setReportRequestedAction('');
    setShowReportPreview(false);
    setShowErrorReportForm(false);
    
    // Recargar reportes
    await loadErrorReports();
    
  } catch (error) {
    console.error('Error enviando reporte:', error);
    showMessage('❌ Error al enviar el reporte');
  }
};

const handleValidateReport = async (reportId) => {
  try {
    await validateErrorReport(reportId, currentUser, userFullNames[currentUser]);
    showMessage('✅ Reporte validado correctamente');
    await loadErrorReports();
  } catch (error) {
    console.error('Error validando reporte:', error);
    showMessage('❌ Error al validar el reporte');
  }
};   
  
  // Listener de autenticación de Firebase
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Usuario autenticado:', user.uid);
    }
  });
  
  return () => unsubscribe();
}, []);
  
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
    
    // NO cargar producciones aquí - se cargan después del login
    
    const salasData = await getSalas();
    if (salasData && salasData.length > 0) {
      setEditableItems(salasData);
    }
    if (isLoggedIn) {
      await loadErrorReports();
    }
    console.log('✅ Datos cargados desde Firebase');
  } catch (e) {
    console.error('❌ Error cargando desde Firebase:', e);
    try {
      const usersData = localStorage.getItem('production-users');
      const passData = localStorage.getItem('production-passwords');
      const namesData = localStorage.getItem('production-fullnames');
      const prodsData = localStorage.getItem('production-records');
      const salasData = localStorage.getItem('production-salas');
      
      if (usersData) setUsers(JSON.parse(usersData));
      if (passData) setUserPasswords(JSON.parse(passData));
      if (namesData) setUserFullNames(JSON.parse(namesData));
      if (prodsData) setProductions(JSON.parse(prodsData));
      if (salasData) setEditableItems(JSON.parse(salasData));
      
      console.log('⚠️ Datos cargados desde localStorage (fallback)');
    } catch (fallbackError) {
      console.error('❌ Error en fallback localStorage:', fallbackError);
    }
  }
};

       function ProductionForm({ currentUser, items, sopCategories, onSubmit }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sala, setSala] = useState('');
  const [turno, setTurno] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [sopCategory, setSopCategory] = useState('');
  const [productionNotes, setProductionNotes] = useState('');  // ← AGREGAR ESTA LÍNEA
  const [rxEspeciales, setRxEspeciales] = useState([
    { examen: '', cantidad: '' },
    { examen: '', cantidad: '' },
    { examen: '', cantidad: '' }
  ]);
  const [procedimientos, setProcedimientos] = useState([
    { nombre: '', cantidad: '' },
    { nombre: '', cantidad: '' },
    { nombre: '', cantidad: '' }
  ]);
    
    const handleSubmit = () => {
      if (!sala || !turno) {
        alert('Por favor completa sala y turno');
        return;
      }
      
      if (sala === 'Rx Sop' && !sopCategory) {
        alert('Por favor selecciona una categoría de Rx SOP');
        return;
      }
      
      if (sala === 'Rx especiales') {
        const hasValid = rxEspeciales.some(esp => esp.examen.trim() && esp.cantidad);
        if (!hasValid) {
          alert('Por favor ingresa al menos un examen especial');
          return;
        }
        const success = onSubmit(date, sala, turno, 0, null, rxEspeciales, procedimientos, productionNotes);
       if (success) {
          setSala('');
          setTurno('');
          setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]);
          setProcedimientos([{ nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }]);
          setProductionNotes('');  // ← AGREGAR ESTA LÍNEA
        }
        return;
      }
      
      if (!cantidad) {
        alert('Por favor ingresa la cantidad');
        return;
      }

const success = onSubmit(date, sala, turno, cantidad, sopCategory, null, procedimientos, productionNotes);
     if (success) {
    setSala('');
    setTurno('');
    setCantidad('');
    setSopCategory('');
    setProcedimientos([{ nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }]);
    setProductionNotes('');  
  }
};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={currentUser}
              disabled
              className="w-full px-4 py-2 border border-green-200 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <select
              value={sala}
              onChange={(e) => {
                setSala(e.target.value);
                setSopCategory('');
                setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]);
              }}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar sala</option>
              {items.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          
          {sala === 'Rx Sop' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Rx SOP</label>
              <select
                value={sopCategory}
                onChange={(e) => setSopCategory(e.target.value)}
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              >
                <option value="">Seleccionar categoría</option>
                {sopCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar turno</option>
              <option value="Diurno">Diurno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>
          
    {sala !== 'Rx especiales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              />
            </div>
          )}
        </div>  
    {sala === 'Rx especiales' && (
         <div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Exámenes Especiales Realizados</h3>
      {rxEspeciales.map((esp, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Examen {index + 1}</label>
            <input
              type="text"
              value={esp.examen}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].examen = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="Nombre del examen"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={esp.cantidad}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].cantidad = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-green-50 p-4 rounded-lg mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🏥 Procedimientos Realizados</h3>
      {procedimientos.map((proc, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Procedimiento {index + 1}</label>
            <input
              type="text"
              value={proc.nombre}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].nombre = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="Nombre del procedimiento"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={proc.cantidad}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].cantidad = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {/* Campo de Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📝 Notas / Observaciones (opcional)
          </label>
          <textarea
            value={productionNotes}
            onChange={(e) => setProductionNotes(e.target.value)}
            placeholder="Ej: Paciente pediátrico, urgencia, estudio especial..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="2"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Registrar Producción
        </button>
      </div>
    );
  }
    
    const handleLogin = async () => {
  if (!loginDNI || !loginPassword) {
    showMessage('❌ Por favor completa todos los campos');
    return;
  }
  
  if (loginPassword === ADMIN_KEY) {
    setIsAdmin(true);
    setCurrentUser(loginDNI);
    setIsLoggedIn(true);

    if (userPasswords[loginDNI] === loginPassword) {
    setCurrentUser(loginDNI);
    setIsLoggedIn(true);
    setIsAdmin(false);
      
      // Cargar producciones del usuario
    try {
      const prodsData = await getProductionByUser(loginDNI);
      if (prodsData && prodsData.length > 0) {
        setProductions(prodsData);
      }
    } catch (error) {
      console.error('Error cargando producciones usuario:', error);
    }
    
    // Cargar TODAS las producciones para admin
    try {
      const prodsData = await getAllProduction();
      if (prodsData && prodsData.length > 0) {
        setProductions(prodsData);
      }
    } catch (error) {
      console.error('Error cargando producciones admin:', error);
    }
await loadErrorReports();
      return;
  }
  
  if (!users.includes(loginDNI)) {
    showMessage('❌ Usuario no encontrado\n\nEl DNI ingresado no está registrado en el sistema.', 4000);
    return;
  }
  
  if (userPasswords[loginDNI] === loginPassword) {
    setCurrentUser(loginDNI);
    setIsLoggedIn(true);
    setIsAdmin(false);
    
    // Cargar SOLO las producciones de este usuario
    try {
      const prodsData = await getProductionByUser(loginDNI);
      if (prodsData && prodsData.length > 0) {
        setProductions(prodsData);
      }
    } catch (error) {
      console.error('Error cargando producciones usuario:', error);
      await loadErrorReports();
    }
  } else {
    showMessage('❌ Contraseña incorrecta\n\nLa contraseña ingresada no es correcta.\nSi olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?"', 5000);
  }
};
    
    const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser('');
      setIsAdmin(false);
      setLoginDNI('');
      setLoginPassword('');
    };
    
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
    // Guardar en Firebase
    await saveUser({
      dni: userDNI,
      fullname: userName,
      password: newPassword
    });
    
    // Actualizar estado local
    setUsers([...users, userDNI]);
    setUserPasswords({...userPasswords, [userDNI]: newPassword});
    setUserFullNames({...userFullNames, [userDNI]: userName});
    
    // Limpiar campos
    setNewDNI('');
    setNewFullName('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setShowRegister(false);
    
    showMessage(`¡Usuario registrado exitosamente!\n\n👤 ${userName}\n🆔 DNI: ${userDNI}\n\nAhora puedes iniciar sesión`, 5000);
  } catch (error) {
    console.error('Error registrando usuario:', error);
    showMessage('❌ Error al registrar usuario: ' + error.message);
  }
};
    
    const addProduction = async (date, sala, turno, cantidad, sopCategory = null, rxEspeciales = null, procedimientos = null, notas = null) => {
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
    notas: notas || null,  // ← NUEVO CAMPO
    timestamp: new Date().toISOString(),
    procedimientos: procedimientos,
  }));
      
      // Guardar en Firebase
      for (const prod of newProds) {
        await addProductionDB(prod);
      }
      
      setProductions([...productions, ...newProds]);
      alert(`✅ ${newProds.length} examen(es) registrado(s)!`);
      return true;
    } catch (error) {
      console.error('Error guardando producción:', error);
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
  procedimientos: procedimientos || null,
  notas: notas || null,  // ← NUEVO CAMPO
  timestamp: new Date().toISOString()
};
  
  try {
    // Guardar en Firebase
    await addProductionDB(newProd);
    
    setProductions([...productions, newProd]);
    alert('✅ Producción registrada!');
    return true;
  } catch (error) {
    console.error('Error guardando producción:', error);
    alert('❌ Error al registrar: ' + error.message);
    return false;
  }
};
      
    const deleteProduction = (id) => {
      setProductionToDelete(id);
      setShowDeleteDialog(true);
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
    
    // Actualizar en Firebase
    await updateProductionDB(updatedProd.id, updatedProd);
    
    const updatedProductions = productions.map(p => 
      p.id === updatedProd.id ? updatedProd : p
    );
    
    setProductions(updatedProductions);
    setShowEditDialog(false);
    setEditingProduction(null);
    showMessage('✅ Producción actualizada!');
  } catch (error) {
    console.error('Error actualizando producción:', error);
    showMessage('❌ Error al actualizar: ' + error.message);
  }
};
    
    const cancelEdit = () => {
      setShowEditDialog(false);
      setEditingProduction(null);
    };
    
    const confirmDelete = async () => {
  if (productionToDelete) {
    try {
      // Eliminar de Firebase
      await deleteProductionDB(productionToDelete);
      
      setProductions(productions.filter(p => p.id !== productionToDelete));
      showMessage('✅ Registro eliminado!');
    } catch (error) {
      console.error('Error eliminando producción:', error);
      showMessage('❌ Error al eliminar: ' + error.message);
    }
  }
  setShowDeleteDialog(false);
  setProductionToDelete(null);
};
    
    const handlePasswordRecovery = () => {
      if (!recoveryDNI.trim()) {
        showMessage('❌ Por favor ingresa tu DNI');
        return;
      }
      
      if (!users.includes(recoveryDNI.trim())) {
        showMessage('❌ DNI no encontrado\n\nEl DNI ingresado no está registrado en el sistema.', 4000);
        return;
      }
      
      const password = userPasswords[recoveryDNI.trim()];
      showMessage(`🔑 Tu contraseña es: ${password}\n\nPor seguridad, considera cambiarla después de iniciar sesión.`, 6000);
      setShowRecovery(false);
      setRecoveryDNI('');
    };

    const handleEditUser = (dni) => {
  const fullname = userFullNames[dni] || '';
  const password = userPasswords[dni] || '';
  setEditUserData({ fullname, password });
  setEditingUser(dni);
};

const handleSaveUserEdit = async () => {
  if (!editingUser) return;
  
  try {
    await saveUser({
      dni: editingUser,
      fullname: editUserData.fullname,
      password: editUserData.password
    });
    
    const updatedFullNames = { ...userFullNames, [editingUser]: editUserData.fullname };
    setUserFullNames(updatedFullNames);
    
    const updatedPasswords = { ...userPasswords, [editingUser]: editUserData.password };
    setUserPasswords(updatedPasswords);
    
    setEditingUser(null);
    showMessage('✅ Usuario actualizado correctamente');
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    showMessage('❌ Error al actualizar: ' + error.message);
  }
};
    
    const exportToTXT = () => {
      const report = generateReport();
      let content = `REPORTE DE PRODUCCIÓN - ${reportMonth}\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      // Si es admin, mostrar resumen general
      if (isAdmin) {
        content += `TOTAL GENERAL: ${report.totalGeneral}\n`;
        content += `REGISTROS: ${report.recordCount}\n\n`;
        
        content += `TOTALES POR TURNO:\n`;
        content += `${'-'.repeat(40)}\n`;
        Object.entries(report.byTurno).forEach(([turno, total]) => {
          content += `${turno}: ${total}\n`;
        });
        
        content += `\nTOTALES POR SALA:\n`;
        content += `${'-'.repeat(40)}\n`;
        editableItems.forEach(item => {
          if (report.bySala[item] > 0) {
            content += `${item}: ${report.bySala[item]}\n`;
          }
        });
        
        content += `\nTOTALES POR CATEGORÍA RX SOP:\n`;
        content += `${'-'.repeat(40)}\n`;
        let hasSopData = false;
        sopCategories.forEach(cat => {
          if (report.bySopCategory[cat] > 0) {
            content += `${cat}: ${report.bySopCategory[cat]}\n`;
            hasSopData = true;
          }
        });
        if (!hasSopData) {
          content += `(Sin registros de Rx SOP este mes)\n`;
        }
        
        content += `\nTOTALES DE EXÁMENES ESPECIALES:\n`;
        content += `${'-'.repeat(40)}\n`;
        const hasRxEspecialData = Object.keys(report.byRxEspecial).length > 0;
        if (hasRxEspecialData) {
          Object.entries(report.byRxEspecial).forEach(([examen, total]) => {
            content += `${examen}: ${total}\n`;
          });
        } else {
          content += `(Sin exámenes especiales registrados este mes)\n`;
        }
      }
      
      content += `\nDETALLE POR USUARIO:\n`;
      content += `${'='.repeat(60)}\n`;
      
      // Filtrar usuarios según rol
      const usersTo = Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser);
      
      usersTo.forEach(([user, data]) => {
        content += `\nUsuario: ${userFullNames[user] || user}\n`;
        content += `DNI: ${user}\n`;
        content += `Total: ${data.total}\n`;
        content += `Horas trabajadas: ${data.horasTrabajadas}h\n`;
        
        // Agregar categorías SOP si tiene
        const userSopTotal = Object.values(data.sopCategories).reduce((sum, val) => sum + val, 0);
        if (userSopTotal > 0) {
          content += `Rx SOP por categoría:\n`;
          sopCategories.forEach(cat => {
            if (data.sopCategories[cat] > 0) {
              content += `  - ${cat}: ${data.sopCategories[cat]}\n`;
            }
          });
        }
        
        const userRxEspecialTotal = Object.values(data.rxEspeciales || {}).reduce((sum, val) => sum + val, 0);
        if (userRxEspecialTotal > 0) {
          content += `Exámenes Especiales:\n`;
          Object.entries(data.rxEspeciales).forEach(([examen, cantidad]) => {
            if (cantidad > 0) {
              content += `  - ${examen}: ${cantidad}\n`;
            }
          });
        }
        
        content += `${'-'.repeat(40)}\n`;
      });
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = isAdmin ? `reporte-produccion-${reportMonth}.txt` : `reporte-produccion-${userFullNames[currentUser] || currentUser}-${reportMonth}.txt`;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('✅ Reporte ado a TXT');
    };
    
const generateCalendarHTML = (userId, userName, targetMonth) => {
  const filtered = productions.filter(p => 
    p.user === userId && p.date.startsWith(targetMonth)
  );
  
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
  }).forEach(key => {
    sortedMatrix[key] = matrix[key];
  });
  
  const dayTotals = {};
  Object.values(sortedMatrix).forEach(dayData => {
    Object.entries(dayData).forEach(([day, cantidad]) => {
      dayTotals[day] = (dayTotals[day] || 0) + cantidad;
    });
  });
  
  const rowTotals = {};
  Object.entries(sortedMatrix).forEach(([key, dayData]) => {
    rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0);
  });
  
  const monthName = new Date(targetMonth + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  
  let html = `
    <div style="page-break-before: always; margin-top: 40px;">
      <h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">📅 REPORTE CALENDARIO DE PRODUCCIÓN INDIVIDUAL</h2>
      
      <div style="border-top: 3px solid #0284c7; border-bottom: 3px solid #0284c7; padding: 15px 10px; margin: 20px 0; line-height: 1.8;">
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Red Asistencial:</strong> Sabogal</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Departamento:</strong> Ayuda al Diagnóstico y Tratamiento</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Servicio:</strong> Radiodiagnóstico y Ecografía</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Especialidad:</strong> Radiología</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Cargo:</strong> Tecnólogo Médico</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">Usuario:</strong> ${userName}</div>
        <div style="margin-bottom: 6px; font-size: 12px;"><strong style="color: #0369a1;">DNI:</strong> ${userId}</div>
        <div style="font-size: 12px;"><strong style="color: #0369a1;">Mes:</strong> ${monthName}</div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin: 20px 0;">
        <thead>
          <tr>
            <th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px; max-width: 180px;">Sala / Turno</th>
`;
  
  days.forEach(day => {
    html += `            <th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px;">${day}</th>\n`;
  });
  html += `            <th style="background: #1e40af; color: white; padding: 8px 4px; text-align: center; border: 1px solid #1e3a8a; font-size: 9px; font-weight: bold;">Total</th>\n`;
  html += `          </tr>\n        </thead>\n        <tbody>\n`;
  
  Object.entries(sortedMatrix).forEach(([key, dayData]) => {
    html += `          <tr>\n`;
    html += `            <td style="background: #f1f5f9; font-weight: bold; text-align: left; padding: 6px 4px; border: 1px solid #cbd5e1; max-width: 180px; font-size: 9px;">${key}</td>\n`;
    
    days.forEach(day => {
      const value = dayData[day] || '';
      const bgColor = value ? '#dcfce7' : '#f9fafb';
      const textColor = value ? '#166534' : '#9ca3af';
      const fontWeight = value ? 'bold' : 'normal';
      html += `            <td style="background: ${bgColor}; color: ${textColor}; font-weight: ${fontWeight}; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${value || '-'}</td>\n`;
    });
    
    html += `            <td style="background: #dbeafe; font-weight: bold; color: #1e40af; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${rowTotals[key]}</td>\n`;
    html += `          </tr>\n`;
  });
  
  html += `          <tr>\n`;
  html += `            <td style="background: #fef3c7; font-weight: bold; color: #92400e; text-align: left; padding: 6px 4px; border: 1px solid #cbd5e1; font-size: 9px;">TOTAL POR DÍA</td>\n`;
  
  days.forEach(day => {
    const total = dayTotals[day] || '';
    html += `            <td style="background: #fef3c7; font-weight: bold; color: #92400e; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 9px;">${total || '-'}</td>\n`;
  });
  
  const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + val, 0);
  html += `            <td style="background: #fef3c7; font-weight: bold; color: #92400e; padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px;">${grandTotal}</td>\n`;
  html += `          </tr>\n`;
  
  html += `        </tbody>\n      </table>\n    </div>\n`;

    // AGREGAR LEYENDA DE NOTAS
  const productionsWithNotes = filtered.filter(p => p.notas && p.notas.trim());
  
  console.log('===== DEBUG TABLA DE NOTAS =====');
  console.log('Total filtered:', filtered.length);
  console.log('Producciones con notas:', productionsWithNotes.length);
  console.log('Detalle:', productionsWithNotes);
  console.log('================================');
  
  if (productionsWithNotes.length > 0) {
    html += `
      <div style="margin-top: 30px; page-break-inside: avoid;">
        <h3 style="color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 15px;">
          📝 NOTAS Y OBSERVACIONES
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr>
              <th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 15%;">Fecha</th>
              <th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 25%;">Sala</th>
              <th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 12%;">Turno</th>
              <th style="background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; width: 48%;">Observaciones</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    productionsWithNotes.forEach(p => {
      html += `
            <tr>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.date}</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.sala}</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px;">${p.turno}</td>
              <td style="padding: 6px; border: 1px solid #e5e7eb; font-size: 9px; font-style: italic; color: #374151;">
                ${p.notas}
              </td>
            </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  return html;
  };

const exportToPDF = () => {
  console.log('exportToPDF llamado - isAdmin:', isAdmin);
  
  const report = generateReport();
  const hasSopData = Object.values(report.bySopCategory).some(val => val > 0);
  
  let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Producción - ${reportMonth}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px;
      background: white;
    }
    h1 { 
      color: #4F46E5; 
      border-bottom: 3px solid #4F46E5; 
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 { 
      color: #7C3AED; 
      margin-top: 30px; 
      border-bottom: 2px solid #E9D5FF; 
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    .summary { 
      background: #EEF2FF; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 20px 0;
      display: flex;
      gap: 30px;
    }
    .user-section { 
      background: #F9FAFB; 
      padding: 15px; 
      margin: 15px 0; 
      border-left: 4px solid #4F46E5;
      page-break-inside: avoid;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
      page-break-inside: avoid;
    }
    th { 
      background: #4F46E5; 
      color: white; 
      padding: 10px; 
      text-align: left;
      font-weight: bold;
    }
    td { 
      padding: 8px; 
      border-bottom: 1px solid #E5E7EB;
    }
    tr:nth-child(even) { 
      background: #F9FAFB; 
    }
    .stat { 
      flex: 1;
    }
    .stat-label { 
      color: #6B7280; 
      font-size: 14px;
      margin-bottom: 5px;
    }
    .stat-value { 
      color: #1F2937; 
      font-size: 24px; 
      font-weight: bold;
    }
    .sop-section { 
      background: #FEF3C7; 
      padding: 10px; 
      border-radius: 5px; 
      margin: 10px 0; 
      border-left: 4px solid #F59E0B;
    }
    .footer {
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 2px solid #E5E7EB; 
      color: #6B7280; 
      font-size: 12px;
      text-align: center;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #DC2626;
    }
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
`;

  if (isAdmin) {
    console.log('Generando reporte para ADMIN');
    
    content += `
  <h1>📊 Reporte de Producción General - ${reportMonth}</h1>
  
  <div class="summary">
    <div class="stat">
      <div class="stat-label">Total General</div>
      <div class="stat-value">${report.totalGeneral}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total de Registros</div>
      <div class="stat-value">${report.recordCount}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Usuarios Activos</div>
      <div class="stat-value">${Object.keys(report.byUser).length}</div>
    </div>
  </div>
  
  <h2>📅 Totales por Turno</h2>
  <table>
    <tr><th>Turno</th><th>Total</th><th>Porcentaje</th></tr>
    ${Object.entries(report.byTurno).map(([turno, total]) => 
      `<tr>
        <td><strong>${turno}</strong></td>
        <td><strong>${total}</strong></td>
        <td>${report.totalGeneral > 0 ? ((total / report.totalGeneral) * 100).toFixed(1) : 0}%</td>
      </tr>`
    ).join('')}
  </table>
  
  <h2>🏥 Totales por Sala</h2>
  <table>
    <tr><th>Sala</th><th>Total</th><th>Porcentaje</th></tr>
    ${editableItems.filter(item => report.bySala[item] > 0).map(item => 
      `<tr>
        <td>${item}</td>
        <td><strong>${report.bySala[item]}</strong></td>
        <td>${report.totalGeneral > 0 ? ((report.bySala[item] / report.totalGeneral) * 100).toFixed(1) : 0}%</td>
      </tr>`
    ).join('')}
  </table>
  
  ${hasSopData ? `
  <h2>🔬 Totales por Categoría Rx SOP</h2>
  <table>
    <tr><th>Categoría</th><th>Total</th></tr>
    ${sopCategories.filter(cat => report.bySopCategory[cat] > 0).map(cat => 
      `<tr>
        <td>${cat}</td>
        <td><strong>${report.bySopCategory[cat]}</strong></td>
      </tr>`
    ).join('')}
  </table>
  ` : ''}
  
  ${Object.keys(report.byRxEspecial).length > 0 ? `
  <h2>🔬 Totales de Exámenes Especiales</h2>
  <table>
    <tr><th>Examen</th><th>Total</th></tr>
    ${Object.entries(report.byRxEspecial).map(([examen, total]) => 
      `<tr>
        <td>${examen}</td>
        <td><strong>${total}</strong></td>
      </tr>`
    ).join('')}
  </table>
  ` : ''}
  
  <h2>👥 Resumen por Usuario</h2>
  ${Object.entries(report.byUser).map(([user, data]) => {
    const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0);
    return `
    <div class="user-section">
      <h3>👤 ${userFullNames[user] || user}</h3>
      <table style="margin: 10px 0;">
        <tr>
          <th>Total</th>
          <th>Horas Trabajadas</th>
          <th>Promedio/Hora</th>
        </tr>
        <tr>
          <td><strong>${data.total}</strong></td>
          <td><strong>${data.horasTrabajadas}h</strong></td>
          <td><strong>${data.horasTrabajadas > 0 ? (data.total / data.horasTrabajadas).toFixed(2) : 0}</strong></td>
        </tr>
      </table>
      
      <p><strong>📊 Distribución por Turno:</strong></p>
      <table style="margin: 10px 0;">
        <tr>
          <th>Diurno</th>
          <th>Mañana</th>
          <th>Tarde</th>
          <th>Noche</th>
        </tr>
        <tr>
          <td>${data.turnos.Diurno}</td>
          <td>${data.turnos.Mañana}</td>
          <td>${data.turnos.Tarde}</td>
          <td>${data.turnos.Noche}</td>
        </tr>
      </table>
      
      ${userSopTotal > 0 ? `
      <div class="sop-section">
        <strong>🔬 Rx SOP por categoría:</strong><br><br>
        <table>
          <tr><th>Categoría</th><th>Cantidad</th></tr>
          ${sopCategories.filter(cat => data.sopCategories[cat] > 0).map(cat => 
            `<tr><td>${cat}</td><td><strong>${data.sopCategories[cat]}</strong></td></tr>`
          ).join('')}
        </table>
      </div>
      ` : ''}
      
      ${Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 ? `
      <div class="sop-section" style="background: #DBEAFE; border-left: 4px solid #3B82F6;">
        <strong>🔬 Exámenes Especiales:</strong><br><br>
        <table>
          <tr><th>Examen</th><th>Cantidad</th></tr>
          ${Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => 
            `<tr><td>${examen}</td><td><strong>${cantidad}</strong></td></tr>`
          ).join('')}
        </table>
      </div>
      ` : ''}
    </div>
  `}).join('')}
`;
    
    console.log('Agregando calendarios individuales para', Object.keys(report.byUser).length, 'usuarios');
    Object.keys(report.byUser).forEach(user => {
      const calHtml = generateCalendarHTML(user, userFullNames[user] || user, reportMonth);
      if (calHtml) {
        content += calHtml;
      }
    });
    
  } else {
    console.log('Generando calendario individual para usuario:', currentUser);
    const userName = userFullNames[currentUser] || currentUser;
    const calHtml = generateCalendarHTML(currentUser, userName, reportMonth);
    
    if (calHtml) {
      content += calHtml;
    } else {
      content += `
      <div style="padding: 40px; text-align: center;">
        <h2 style="color: #DC2626;">⚠️ Sin datos</h2>
        <p style="color: #6B7280;">No hay registros de producción para este mes.</p>
      </div>
      `;
    }
  }
  
  content += `
  <div class="footer">
    <p><strong>Sistema de Producción Diaria - EsSalud</strong></p>
    <p>Reporte generado el ${new Date().toLocaleString('es-PE', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>
</body>
</html>`;
  
  try {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const fileName = isAdmin 
      ? `reporte-produccion-completo-${reportMonth}.html`
      : `reporte-calendario-${userFullNames[currentUser] || currentUser}-${reportMonth}.html`;
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const mensaje = isAdmin 
      ? '✅ Reporte completo descargado!\n\nIncluye:\n✔️ Reporte general de producción\n✔️ Resumen por usuarios\n✔️ Calendarios individuales de TODOS los usuarios\n\n📄 Para convertir a PDF:\n1. Abre el archivo HTML\n2. Click en "Imprimir / Guardar como PDF"\n3. Selecciona "Guardar como PDF"\n4. Click en "Guardar"'
      : '✅ Tu reporte individual descargado!\n\n📄 Para convertir a PDF:\n1. Abre el archivo HTML\n2. Click en "Imprimir / Guardar como PDF"\n3. Selecciona "Guardar como PDF"\n4. Click en "Guardar"';
    
    alert(mensaje);
  } catch (error) {
    console.error('Error al exportar:', error);
    alert('❌ Error al exportar el reporte: ' + error.message);
  }
};

    const exportAdminIndividualPDF = (userId, targetMonth) => {
  const userName = userFullNames[userId] || userId;
  const calHtml = generateCalendarHTML(userId, userName, targetMonth);
  
  if (!calHtml) {
    alert('❌ No hay registros para este usuario en el mes seleccionado');
    return;
  }
  
  let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Individual - ${userName}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px;
      background: white;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #DC2626;
    }
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  ${calHtml}
</body>
</html>`;
  
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-individual-${userName.replace(/\s+/g, '-')}-${targetMonth}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Reporte individual descargado!\n\n📄 Para convertir a PDF:\n1. Abre el archivo HTML\n2. Click en "Imprimir / Guardar como PDF"\n3. Selecciona "Guardar como PDF"\n4. Click en "Guardar"');
};

const exportAdminGeneralPDF = (targetMonth) => {
  const filtered = productions.filter(p => p.date.startsWith(targetMonth));
  
  if (filtered.length === 0) {
    alert('❌ No hay registros para el mes seleccionado');
    return;
  }
  
// Generar reporte para el mes específico
  const byUser = {};
  const byTurno = { 'Diurno': 0, 'Mañana': 0, 'Tarde': 0, 'Noche': 0 };
  const bySala = {};
  const bySopCategory = {};
  const byRxEspecial = {};
  
  editableItems.forEach(item => { bySala[item] = 0; });
  sopCategories.forEach(cat => { bySopCategory[cat] = 0; });
  
  filtered.forEach(p => {
    if (!byUser[p.user]) {
      byUser[p.user] = { 
        total: 0, 
        horasTrabajadas: 0,
        turnosPorFecha: {},
        turnos: { 'Diurno': 0, 'Mañana': 0, 'Tarde': 0, 'Noche': 0 }, 
        salas: {},
        sopCategories: {},
        rxEspeciales: {}
      };
      editableItems.forEach(item => { byUser[p.user].salas[item] = 0; });
      sopCategories.forEach(cat => { byUser[p.user].sopCategories[cat] = 0; });
    }
    
    const cantidad = Number(p.cantidad) || 0;
    byUser[p.user].total += cantidad;
    
    if (p.turno && p.date) {
      const fechaTurnoKey = `${p.date}-${p.turno}`;
      
      if (!byUser[p.user].turnosPorFecha[fechaTurnoKey]) {
        byUser[p.user].turnosPorFecha[fechaTurnoKey] = true;
        
        if (p.turno === 'Mañana' || p.turno === 'Tarde') {
          byUser[p.user].horasTrabajadas += 6;
        } else if (p.turno === 'Diurno' || p.turno === 'Noche') {
          byUser[p.user].horasTrabajadas += 12;
        }
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
      const examenNombre = p.rxEspecialExamen;
      byRxEspecial[examenNombre] = (byRxEspecial[examenNombre] || 0) + cantidad;
      byUser[p.user].rxEspeciales[examenNombre] = (byUser[p.user].rxEspeciales[examenNombre] || 0) + cantidad;
    }
  });
  
  const totalGeneral = filtered.reduce((sum, p) => sum + (Number(p.cantidad) || 0), 0);
  const report = { byUser, totalGeneral, bySala, byTurno, bySopCategory, byRxEspecial, recordCount: filtered.length };
  const hasSopData = Object.values(report.bySopCategory).some(val => val > 0);
  
  let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte General - ${targetMonth}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px;
      background: white;
    }
    h1 { 
      color: #4F46E5; 
      border-bottom: 3px solid #4F46E5; 
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 { 
      color: #7C3AED; 
      margin-top: 30px; 
      border-bottom: 2px solid #E9D5FF; 
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    .summary { 
      background: #EEF2FF; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 20px 0;
      display: flex;
      gap: 30px;
    }
    .user-section { 
      background: #F9FAFB; 
      padding: 15px; 
      margin: 15px 0; 
      border-left: 4px solid #4F46E5;
      page-break-inside: avoid;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
      page-break-inside: avoid;
    }
    th { 
      background: #4F46E5; 
      color: white; 
      padding: 10px; 
      text-align: left;
      font-weight: bold;
    }
    td { 
      padding: 8px; 
      border-bottom: 1px solid #E5E7EB;
    }
    tr:nth-child(even) { 
      background: #F9FAFB; 
    }
    .stat { 
      flex: 1;
    }
    .stat-label { 
      color: #6B7280; 
      font-size: 14px;
      margin-bottom: 5px;
    }
    .stat-value { 
      color: #1F2937; 
      font-size: 24px; 
      font-weight: bold;
    }
    .sop-section { 
      background: #FEF3C7; 
      padding: 10px; 
      border-radius: 5px; 
      margin: 10px 0; 
      border-left: 4px solid #F59E0B;
    }
    .footer {
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 2px solid #E5E7EB; 
      color: #6B7280; 
      font-size: 12px;
      text-align: center;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #DC2626;
    }
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  
  <h1>📊 Reporte de Producción General - ${targetMonth}</h1>
  
  <div class="summary">
    <div class="stat">
      <div class="stat-label">Total General</div>
      <div class="stat-value">${report.totalGeneral}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total de Registros</div>
      <div class="stat-value">${report.recordCount}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Usuarios Activos</div>
      <div class="stat-value">${Object.keys(report.byUser).length}</div>
    </div>
  </div>
  
  <h2>📅 Totales por Turno</h2>
  <table>
    <tr><th>Turno</th><th>Total</th><th>Porcentaje</th></tr>
    ${Object.entries(report.byTurno).map(([turno, total]) => 
      `<tr>
        <td><strong>${turno}</strong></td>
        <td><strong>${total}</strong></td>
        <td>${report.totalGeneral > 0 ? ((total / report.totalGeneral) * 100).toFixed(1) : 0}%</td>
      </tr>`
    ).join('')}
  </table>
  
  <h2>🏥 Totales por Sala</h2>
  <table>
    <tr><th>Sala</th><th>Total</th><th>Porcentaje</th></tr>
    ${editableItems.filter(item => report.bySala[item] > 0).map(item => 
      `<tr>
        <td>${item}</td>
        <td><strong>${report.bySala[item]}</strong></td>
        <td>${report.totalGeneral > 0 ? ((report.bySala[item] / report.totalGeneral) * 100).toFixed(1) : 0}%</td>
      </tr>`
    ).join('')}
  </table>
  
  ${hasSopData ? `
  <h2>🔬 Totales por Categoría Rx SOP</h2>
  <table>
    <tr><th>Categoría</th><th>Total</th></tr>
    ${sopCategories.filter(cat => report.bySopCategory[cat] > 0).map(cat => 
      `<tr>
        <td>${cat}</td>
        <td><strong>${report.bySopCategory[cat]}</strong></td>
      </tr>`
    ).join('')}
  </table>
  ` : ''}
  
  ${Object.keys(report.byRxEspecial).length > 0 ? `
  <h2>🔬 Totales de Exámenes Especiales</h2>
  <table>
    <tr><th>Examen</th><th>Total</th></tr>
    ${Object.entries(report.byRxEspecial).map(([examen, total]) => 
      `<tr>
        <td>${examen}</td>
        <td><strong>${total}</strong></td>
      </tr>`
    ).join('')}
  </table>
  ` : ''}
  
  <h2>👥 Resumen por Usuario</h2>
  ${Object.entries(report.byUser).map(([user, data]) => {
    const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0);
    return `
    <div class="user-section">
      <h3>👤 ${userFullNames[user] || user}</h3>
      <table style="margin: 10px 0;">
        <tr>
          <th>Total</th>
          <th>Horas Trabajadas</th>
          <th>Promedio/Hora</th>
        </tr>
        <tr>
          <td><strong>${data.total}</strong></td>
          <td><strong>${data.horasTrabajadas}h</strong></td>
          <td><strong>${data.horasTrabajadas > 0 ? (data.total / data.horasTrabajadas).toFixed(2) : 0}</strong></td>
        </tr>
      </table>
      
      <p><strong>📊 Distribución por Turno:</strong></p>
      <table style="margin: 10px 0;">
        <tr>
          <th>Diurno</th>
          <th>Mañana</th>
          <th>Tarde</th>
          <th>Noche</th>
        </tr>
        <tr>
          <td>${data.turnos.Diurno}</td>
          <td>${data.turnos.Mañana}</td>
          <td>${data.turnos.Tarde}</td>
          <td>${data.turnos.Noche}</td>
        </tr>
      </table>
      
      ${userSopTotal > 0 ? `
      <div class="sop-section">
        <strong>🔬 Rx SOP por categoría:</strong><br><br>
        <table>
          <tr><th>Categoría</th><th>Cantidad</th></tr>
          ${sopCategories.filter(cat => data.sopCategories[cat] > 0).map(cat => 
            `<tr><td>${cat}</td><td><strong>${data.sopCategories[cat]}</strong></td></tr>`
          ).join('')}
        </table>
      </div>
      ` : ''}
      
      ${Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 ? `
      <div class="sop-section" style="background: #DBEAFE; border-left: 4px solid #3B82F6;">
        <strong>🔬 Exámenes Especiales:</strong><br><br>
        <table>
          <tr><th>Examen</th><th>Cantidad</th></tr>
          ${Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => 
            `<tr><td>${examen}</td><td><strong>${cantidad}</strong></td></tr>`
          ).join('')}
        </table>
      </div>
      ` : ''}
    </div>
  `}).join('')}
`;
  
  // Agregar calendarios individuales de cada usuario
  Object.keys(report.byUser).forEach(user => {
    const calHtml = generateCalendarHTML(user, userFullNames[user] || user, targetMonth);
    if (calHtml) {
      content += calHtml;
    }
  });
  
  content += `
  <div class="footer">
    <p><strong>Sistema de Producción Diaria - EsSalud</strong></p>
    <p>Reporte generado el ${new Date().toLocaleString('es-PE', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>
</body>
</html>`;
  
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-general-todos-${targetMonth}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Reporte general descargado!\n\nIncluye:\n✔️ Estadísticas generales\n✔️ Resumen de TODOS los usuarios\n✔️ Calendarios individuales\n\n📄 Para convertir a PDF:\n1. Abre el archivo HTML\n2. Click en "Imprimir / Guardar como PDF"\n3. Selecciona "Guardar como PDF"\n4. Click en "Guardar"');
};
         
    const deleteUser = (dni) => {
  console.log('deleteUser llamado para:', dni);
  
  setConfirmDialogData({
    title: '🗑️ Eliminar Usuario',
    message: `¿Eliminar usuario ${userFullNames[dni] || dni}?\n\nEsto también eliminará todos sus registros de producción.\n\n⚠️ Esta acción no se puede deshacer.`,
    onConfirm: async () => {
      try {
        // Eliminar de Firebase
        await deleteUserDB(dni);
        
        const updatedUsers = users.filter(u => u !== dni);
        const updatedPasswords = {...userPasswords};
        const updatedNames = {...userFullNames};
        delete updatedPasswords[dni];
        delete updatedNames[dni];
        
        const updatedProductions = productions.filter(p => p.user !== dni);
        
        // Eliminar producciones del usuario de Firebase
        const userProductions = productions.filter(p => p.user === dni);
        for (const prod of userProductions) {
          await deleteProductionDB(prod.id);
        }
        
        setUsers(updatedUsers);
        setUserPasswords(updatedPasswords);
        setUserFullNames(updatedNames);
        setProductions(updatedProductions);
        
        console.log('Usuario eliminado exitosamente');
        setSuccessMessageText('✅ Usuario eliminado exitosamente\n\nSe eliminaron también todos sus registros de producción.');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 4000);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        setSuccessMessageText('❌ Error al eliminar usuario: ' + error.message);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 4000);
      }
    }
  });
  setShowConfirmDialog(true);
};

const handleChangePassword = () => {
  // Validar que todos los campos estén llenos
  if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
    setSuccessMessageText('❌ Por favor completa todos los campos');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    return;
  }
  
  // Verificar que la contraseña actual sea correcta
  if (userPasswords[currentUser] !== changePasswordData.currentPassword) {
    setSuccessMessageText('❌ La contraseña actual es incorrecta');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    return;
  }
  
  // Verificar que la nueva contraseña tenga al menos 4 caracteres
  if (changePasswordData.newPassword.length < 4) {
    setSuccessMessageText('❌ La nueva contraseña debe tener al menos 4 caracteres');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    return;
  }
  
  // Verificar que las contraseñas coincidan
  if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
    setSuccessMessageText('❌ Las contraseñas no coinciden');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    return;
  }
  
  // Actualizar la contraseña
  const updatedPasswords = { ...userPasswords, [currentUser]: changePasswordData.newPassword };
  setUserPasswords(updatedPasswords);
  localStorage.setItem('production-passwords', JSON.stringify(updatedPasswords));
  
  // Cerrar modal y limpiar datos
  setShowChangePassword(false);
  setChangePasswordData({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  setSuccessMessageText('✅ Contraseña cambiada exitosamente');
  setShowSuccessMessage(true);
  setTimeout(() => setShowSuccessMessage(false), 3000);
};
    
    const resetUserPassword = (dni) => {
      console.log('resetUserPassword llamado para:', dni);
      
      const userName = userFullNames[dni] || dni;
      
      setPromptDialogData({
        title: '🔑 Reset de Contraseña',
        message: `Nueva contraseña para ${userName}:\n\n(Mínimo 4 caracteres)`,
        onConfirm: (newPass) => {
          if (!newPass || newPass.trim().length === 0) {
            setSuccessMessageText('❌ La contraseña no puede estar vacía');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            return;
          }
          
          if (newPass.length < 4) {
            setSuccessMessageText('❌ La contraseña debe tener al menos 4 caracteres');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            return;
          }
          
          try {
            const updatedPasswords = {...userPasswords, [dni]: newPass};
            setUserPasswords(updatedPasswords);
            
            console.log('Contraseña actualizada exitosamente');
            setSuccessMessageText(`✅ Contraseña actualizada exitosamente\n\n👤 Usuario: ${userName}\n🔐 Nueva contraseña: ${newPass}\n\n⚠️ Asegúrate de informar al usuario su nueva contraseña.`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 6000);
          } catch (error) {
            console.error('Error al resetear contraseña:', error);
            setSuccessMessageText('❌ Error al actualizar contraseña: ' + error.message);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 4000);
          }
        }
      });
      setPromptValue('');
      setShowPromptDialog(true);
    };
    
    const addSala = async () => {
  if (!newSalaName.trim()) {
    alert('Por favor ingresa el nombre de la sala');
    return;
  }
  
  if (editableItems.includes(newSalaName.trim())) {
    alert('Esta sala ya existe');
    return;
  }
  
  try {
    const newSalas = [...editableItems, newSalaName.trim()];
    
    // Guardar en Firebase
    await saveSalas(newSalas);
    
    setEditableItems(newSalas);
    setNewSalaName('');
    alert('✅ Sala agregada');
  } catch (error) {
    console.error('Error agregando sala:', error);
    alert('❌ Error al agregar sala: ' + error.message);
  }
};
    
    const deleteSala = (sala) => {
  setConfirmDialogData({
    title: '🗑️ Eliminar Sala',
    message: `¿Eliminar sala "${sala}"?\n\nLos registros existentes con esta sala se mantendrán, pero no podrás crear nuevos.`,
    onConfirm: async () => {
      try {
        const newSalas = editableItems.filter(s => s !== sala);
        
        // Guardar en Firebase
        await saveSalas(newSalas);
        
        setEditableItems(newSalas);
        setSuccessMessageText('✅ Sala eliminada exitosamente');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('Error eliminando sala:', error);
        setSuccessMessageText('❌ Error al eliminar sala: ' + error.message);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  });
  setShowConfirmDialog(true);
};
    
    const getMyProductions = () => {
      return productions
        .filter(p => p.user === currentUser && p.date.startsWith(myProductionMonth))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    };
    
    const getAllProductions = () => {
      let filtered = productions.filter(p => p.date.startsWith(adminProductionMonth));
      
      // Filtrar por usuario si se especifica
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
          byUser[p.user] = { 
            total: 0, 
            horasTrabajadas: 0,
            turnosPorFecha: {}, // Para controlar turnos únicos por fecha
            turnos: { 'Diurno': 0, 'Mañana': 0, 'Tarde': 0, 'Noche': 0 }, 
            salas: {},
            sopCategories: {},
            rxEspeciales: {}
          };
          editableItems.forEach(item => { byUser[p.user].salas[item] = 0; });
          sopCategories.forEach(cat => { byUser[p.user].sopCategories[cat] = 0; });
        }
        
        const cantidad = Number(p.cantidad) || 0;
        byUser[p.user].total += cantidad;
        
        // Calcular horas trabajadas (solo contar cada turno una vez por fecha)
        if (p.turno && p.date) {
          const fechaTurnoKey = `${p.date}-${p.turno}`;
          
          if (!byUser[p.user].turnosPorFecha[fechaTurnoKey]) {
            // Primera vez que se registra este turno en esta fecha
            byUser[p.user].turnosPorFecha[fechaTurnoKey] = true;
            
            // Asignar horas según turno
            if (p.turno === 'Mañana' || p.turno === 'Tarde') {
              byUser[p.user].horasTrabajadas += 6;
            } else if (p.turno === 'Diurno' || p.turno === 'Noche') {
              byUser[p.user].horasTrabajadas += 12;
            }
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
          const examenNombre = p.rxEspecialExamen;
          byRxEspecial[examenNombre] = (byRxEspecial[examenNombre] || 0) + cantidad;
          byUser[p.user].rxEspeciales[examenNombre] = (byUser[p.user].rxEspeciales[examenNombre] || 0) + cantidad;
        }
      });
      
      const totalGeneral = filtered.reduce((sum, p) => sum + (Number(p.cantidad) || 0), 0);
      return { byUser, totalGeneral, bySala, byTurno, bySopCategory, byRxEspecial, recordCount: filtered.length, productions: filtered };
    };
    
    if (!isLoggedIn) {
      if (showRecovery) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔑 Recuperar Contraseña</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input
                    type="text"
                    value={recoveryDNI}
                    onChange={(e) => setRecoveryDNI(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordRecovery()}
                    placeholder="Ingresa tu DNI"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoveryDNI('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasswordRecovery}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    Recuperar
                  </button>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Nombre y apellido"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input
                    type="text"
                    value={newDNI}
                    onChange={(e) => setNewDNI(e.target.value)}
                    placeholder="Ingresa tu DNI"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                    >
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRegister(false);
                      setNewDNI('');
                      setNewFullName('');
                      setNewPassword('');
                      setNewPasswordConfirm('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    Registrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          {showSuccessMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
              <div className={`${successMessageText.includes('❌') ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{successMessageText.includes('❌') ? '❌' : '✅'}</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">
                      {successMessageText.includes('❌') ? '¡Error!' : successMessageText.includes('🔑') ? 'Recuperación de Contraseña' : '¡Éxito!'}
                    </div>
                    <div className="text-sm whitespace-pre-line">{successMessageText}</div>
                  </div>
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="text-white hover:text-gray-200 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <TrendingUp className="text-indigo-600 mx-auto mb-4" size={48} />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Producción Diaria</h1>
              <p className="text-gray-600">Inicia sesión para continuar</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input
                  type="text"
                  value={loginDNI}
                  onChange={(e) => setLoginDNI(e.target.value)}
                  placeholder="Ingresa tu DNI"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
              >
                Iniciar Sesión
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">¿Primera vez aquí?</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowRegister(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Crear Nueva Cuenta
              </button>
              
              <button
                onClick={() => setShowRecovery(true)}
                className="w-full px-4 py-2 text-indigo-600 hover:text-indigo-800 transition font-medium text-sm"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* Mensaje de Éxito/Error */}
        {showSuccessMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className={`${successMessageText.includes('❌') ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{successMessageText.includes('❌') ? '❌' : successMessageText.includes('🔑') ? '🔑' : '✅'}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">
                    {successMessageText.includes('❌') ? '¡Error!' : successMessageText.includes('🔑') ? 'Información' : '¡Éxito!'}
                  </div>
                  <div className="text-sm whitespace-pre-line">{successMessageText}</div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-white hover:text-gray-200 text-xl font-bold"
                >
                  ×
                </button>
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
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    confirmDialogData.onConfirm?.();
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Confirmar
                </button>
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
              <input
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setShowPromptDialog(false);
                    promptDialogData.onConfirm?.(promptValue);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="Ingresa la contraseña..."
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPromptDialog(false);
                    setPromptValue('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowPromptDialog(false);
                    promptDialogData.onConfirm?.(promptValue);
                  }}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showEditDialog && editingProduction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Producción</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={editingProduction.date}
                    onChange={(e) => setEditingProduction({...editingProduction, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                  <select
                    value={editingProduction.sala}
                    onChange={(e) => setEditingProduction({...editingProduction, sala: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar sala</option>
                    {editableItems.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <select
                    value={editingProduction.turno}
                    onChange={(e) => setEditingProduction({...editingProduction, turno: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar turno</option>
                    <option value="Diurno">Diurno</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={editingProduction.cantidad}
                    onChange={(e) => setEditingProduction({...editingProduction, cantidad: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                {editingProduction.rxEspecialExamen && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Examen Especial</label>
                    <input
                      type="text"
                      value={editingProduction.rxEspecialExamen}
                      onChange={(e) => setEditingProduction({...editingProduction, rxEspecialExamen: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
                
                {editingProduction.sopCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría SOP</label>
                    <select
                      value={editingProduction.sopCategory}
                      onChange={(e) => setEditingProduction({...editingProduction, sopCategory: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccionar categoría</option>
                      {sopCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedProduction}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">¿Eliminar registro?</h3>
              <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        
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
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-bold"
                  >
                    ⚙️ Panel Admin
                  </button>
                )}
                <button
              onClick={(e) => { e.preventDefault(); setShowChangePassword(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              🔑 Cambiar Contraseña
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-bold"
            >
              🚪 Cerrar Sesión
            </button>
              </div>
            </div>
            
            {showAdminPanel && isAdmin && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Panel de Administración</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">👥 Gestión de Usuarios</h3>
                    
                    <button
                      onClick={() => {
                        console.log('BOTÓN DE PRUEBA CLICKEADO');
                        alert('✅ El botón funciona! Los clicks se están registrando.');
                      }}
                      className="mb-3 w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      🧪 Test - Click aquí primero
                    </button>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {users.map(user => (
                        <div key={user} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{userFullNames[user] || user}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditUser(user);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔑 Reset clickeado para:', user);
                                resetUserPassword(user);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              🔑 Reset
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🗑️ Eliminar clickeado para:', user);
                                deleteUser(user);
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">🏥 Gestión de Salas</h3>
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSalaName}
                          onChange={(e) => setNewSalaName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSala()}
                          placeholder="Nueva sala"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={addSala}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editableItems.map(sala => (
                        <div key={sala} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{sala}</span>
                          <button
                            onClick={() => deleteSala(sala)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
{editingUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Editar Usuario: {editingUser}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nombre Completo</label>
        <input
          type="text"
          value={editUserData.fullname}
          onChange={(e) => setEditUserData({ ...editUserData, fullname: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="text"
          value={editUserData.password}
          onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSaveUserEdit}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Guardar
        </button>
        <button
          onClick={() => setEditingUser(null)}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

{showChangePassword && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">🔑 Cambiar Contraseña</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
        <input
          type="password"
          value={changePasswordData.currentPassword}
          onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Ingresa tu contraseña actual"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
        <input
          type="password"
          value={changePasswordData.newPassword}
          onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Mínimo 4 caracteres"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Confirmar Nueva Contraseña</label>
        <input
          type="password"
          value={changePasswordData.confirmPassword}
          onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Repite la nueva contraseña"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleChangePassword}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Cambiar
        </button>
        <button
          onClick={() => {
            setShowChangePassword(false);
            setChangePasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
            
            {showAdminPanel && isAdmin && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-cyan-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Gestión de Producción de Todos los Usuarios</h2>

              <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => {
                      if (!filterUserDNI || filterUserDNI === '') {
                        alert('Por favor selecciona un usuario específico para exportar reporte individual');
                        return;
                      }
                      exportAdminIndividualPDF(filterUserDNI, adminProductionMonth);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    📄 Exportar Reporte Individual
                  </button>
                  <button
                    onClick={() => exportAdminGeneralPDF(adminProductionMonth)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                  >
                    📊 Exportar Reporte General (Todos)
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                      <input
                        type="month"
                        value={adminProductionMonth}
                        onChange={(e) => setAdminProductionMonth(e.target.value)}
                        className="w-full px-4 py-2 border border-cyan-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Usuario</label>
                      <select
                        value={filterUserDNI}
                        onChange={(e) => setFilterUserDNI(e.target.value)}
                        className="w-full px-4 py-2 border border-cyan-200 rounded-lg"
                      >
                        <option value="">Todos los usuarios</option>
                        {users.map(user => (
                          <option key={user} value={user}>{userFullNames[user] || user}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {getAllProductions().length > 0 ? (
                      <div className="space-y-2">
                        {getAllProductions().map(prod => (
                          <div key={prod.id} className="border border-cyan-200 rounded-lg p-3 hover:bg-cyan-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-cyan-800">
                                  👤 {userFullNames[prod.user] || prod.user}
                                </div>
                                <div className="text-sm font-semibold text-gray-700">
                                  📅 {prod.date.split('-').reverse().join('/')} - {prod.turno}
                                </div>
                                <div className="text-sm text-gray-600">🏥 {prod.sala}</div>
                                {prod.rxEspecialExamen && (
                                  <div className="text-xs text-blue-600">🔬 Examen: {prod.rxEspecialExamen}</div>
                                )}
                                {prod.sopCategory && (
                                  <div className="text-xs text-orange-600">🏥 Categoría: {prod.sopCategory}</div>
                                )}
                                <div className="text-lg font-bold text-cyan-700">Cantidad: {prod.cantidad}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editProduction(prod)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => deleteProduction(prod.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 p-3 bg-cyan-100 rounded-lg">
                          <div className="text-sm font-semibold text-cyan-800">
                            Total: {getAllProductions().reduce((sum, p) => sum + Number(p.cantidad), 0)}
                          </div>
                          <div className="text-xs text-cyan-600">
                            {getAllProductions().length} registro(s)
                            {filterUserDNI && filterUserDNI !== 'todos' && ` - ${userFullNames[filterUserDNI] || filterUserDNI}`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No hay registros para este mes/usuario</p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
              {/* Campo de Notas */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    📝 Notas / Observaciones (opcional)
  </label>
  <textarea
    value={productionNotes}
    onChange={(e) => setProductionNotes(e.target.value)}
    placeholder="Ej: Paciente pediátrico, urgencia, estudio especial..."
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    rows="2"
  />
</div>

            {!isAdmin && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Mi Producción del Mes</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                <input
                  type="month"
                  value={myProductionMonth}
                  onChange={(e) => setMyProductionMonth(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-lg"
                />
              </div>
              
              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                {getMyProductions().length > 0 ? (
                  <div className="space-y-2">
                    {getMyProductions().map(prod => (
                      <div key={prod.id} className="border border-purple-200 rounded-lg p-3 hover:bg-purple-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {prod.date.split('-').reverse().join('/')} - {prod.turno}
                            </div>
                            <div className="text-sm text-gray-600">{prod.sala}</div>
                            {prod.rxEspecialExamen && (
                              <div className="text-xs text-blue-600">Examen: {prod.rxEspecialExamen}</div>
                            )}
                            {prod.sopCategory && (
                              <div className="text-xs text-orange-600">Categoría: {prod.sopCategory}</div>
                            )}
                            <div className="text-lg font-bold text-purple-700">Cantidad: {prod.cantidad}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProduction(prod)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deleteProduction(prod.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <div className="text-sm font-semibold text-purple-800">
                        Total: {getMyProductions().reduce((sum, p) => sum + Number(p.cantidad), 0)}
                      </div>
                      <div className="text-xs text-purple-600">{getMyProductions().length} registro(s)</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay registros para este mes</p>
                )}
              </div>
            </div>
            )}

            {!isAdmin && (
            <CalendarReport 
              currentUser={currentUser}
              userFullNames={userFullNames}
              productions={productions}
              myProductionMonth={myProductionMonth}
              setMyProductionMonth={setMyProductionMonth}
            />
            )}

            {!isAdmin && (
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
            )}
          </div>
        </div>
      </div>
    );
  }
  
  function CalendarReport({ currentUser, userFullNames, productions, myProductionMonth, setMyProductionMonth }) {
    const [showCalendar, setShowCalendar] = useState(false);
    
    const generateCalendarData = () => {
      // Filtrar producción del usuario y mes actual
      const filtered = productions.filter(p => 
        p.user === currentUser && p.date.startsWith(myProductionMonth)
      );

      const [year, month] = myProductionMonth.split('-');
      
      if (filtered.length === 0) return null;
      
      // Obtener días del mes
      const [yearCal, monthCal] = myProductionMonth.split('-');
      const daysInMonth = new Date(yearCal, monthCal, 0).getDate();
      const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
      
      // Crear estructura: { "Sala/Turno": { día: cantidad } }
      const matrix = {};
      
      filtered.forEach(p => {
        const day = parseInt(p.date.split('-')[2]);
        const key = `${p.sala} / ${p.turno}`;
        
        if (!matrix[key]) {
          matrix[key] = {};
        }
        
        matrix[key][day] = (matrix[key][day] || 0) + Number(p.cantidad);
      });
      
      // Ordenar las filas por turno (Mañana, Tarde, Diurno, Noche)
      const turnoOrder = { 'Mañana': 1, 'Tarde': 2, 'Diurno': 3, 'Noche': 4 };
      const sortedMatrix = {};
      
      Object.keys(matrix).sort((a, b) => {
        const turnoA = a.split(' / ')[1];
        const turnoB = b.split(' / ')[1];
        const orderA = turnoOrder[turnoA] || 5;
        const orderB = turnoOrder[turnoB] || 5;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Si es el mismo turno, ordenar por sala alfabéticamente
        return a.localeCompare(b);
      }).forEach(key => {
        sortedMatrix[key] = matrix[key];
      });
      
      return { matrix: sortedMatrix, days };
    };
    
    const data = generateCalendarData();
    
    if (!data) {
      return (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Reporte Calendario Individual</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input
              type="month"
              value={myProductionMonth}
              onChange={(e) => setMyProductionMonth(e.target.value)}
              className="px-4 py-2 border border-cyan-200 rounded-lg"
            />
          </div>
          <p className="text-gray-500 text-center py-8">No hay registros para este mes</p>
        </div>
      );
    }
    
    const { matrix, days } = data;
    const monthName = new Date(myProductionMonth + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    
    // Calcular totales por día
    const dayTotals = {};
    Object.values(matrix).forEach(dayData => {
      Object.entries(dayData).forEach(([day, cantidad]) => {
        dayTotals[day] = (dayTotals[day] || 0) + cantidad;
      });
    });
    
    // Calcular totales por fila
    const rowTotals = {};
    Object.entries(matrix).forEach(([key, dayData]) => {
      rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0);
    });
    
    const exportCalendarToPDF = () => {
      const userName = userFullNames[currentUser] || currentUser;
      
      let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Reporte Calendario - ${userName}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        margin: 20px;
        font-size: 11px;
      }
      h1 { 
        color: #1e40af; 
        text-align: center;
        margin-bottom: 10px;
      }
      h2 {
        color: #059669;
        text-align: center;
        margin-top: 0;
        font-size: 16px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 20px 0;
        font-size: 10px;
      }
      th { 
        background: #1e40af; 
        color: white; 
        padding: 8px 4px; 
        text-align: center;
        border: 1px solid #1e3a8a;
        font-size: 9px;
      }
      td { 
        padding: 6px 4px; 
        border: 1px solid #cbd5e1;
        text-align: center;
      }
      .sala-col {
        background: #f1f5f9;
        font-weight: bold;
        text-align: left;
        padding-left: 8px;
        max-width: 180px;
        font-size: 9px;
      }
      .total-col {
        background: #dbeafe;
        font-weight: bold;
        color: #1e40af;
      }
      .total-row td {
        background: #fef3c7;
        font-weight: bold;
        color: #92400e;
      }
      .has-value {
        background: #dcfce7;
        font-weight: bold;
        color: #166534;
      }
      .empty {
        background: #f9fafb;
        color: #9ca3af;
      }
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        z-index: 1000;
      }
      @media print {
        .print-button { display: none; }
        body { margin: 0; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <button class="print-button" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    
    <h1 style="text-align: center; color: #1e40af; margin-bottom: 20px;">📅 REPORTE CALENDARIO DE PRODUCCIÓN</h1>
    
    <div style="border-top: 3px solid #0284c7; border-bottom: 3px solid #0284c7; padding: 15px 10px; margin: 20px 0; line-height: 1.8;">
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Red Asistencial:</strong> Sabogal
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Departamento:</strong> Ayuda al Diagnóstico y Tratamiento
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Servicio:</strong> Radiodiagnóstico y Ecografía
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Especialidad:</strong> Radiología
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Cargo:</strong> Tecnólogo Médico
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Usuario:</strong> ${userName}
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">DNI:</strong> ${currentUser}
      </div>
      <div style="font-size: 12px;">
        <strong style="color: #0369a1;">Mes:</strong> ${monthName}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th class="sala-col">Sala / Turno</th>
  `;
      
      // Encabezados de días
      days.forEach(day => {
        html += `        <th>${day}</th>\n`;
      });
      html += `        <th class="total-col">Total</th>\n`;
      html += `      </tr>\n    </thead>\n    <tbody>\n`;
      
      // Filas de datos
      Object.entries(matrix).forEach(([key, dayData]) => {
        html += `      <tr>\n`;
        html += `        <td class="sala-col">${key}</td>\n`;
        
        days.forEach(day => {
          const value = dayData[day] || '';
          const className = value ? 'has-value' : 'empty';
          html += `        <td class="${className}">${value || '-'}</td>\n`;
        });
        
        html += `        <td class="total-col">${rowTotals[key]}</td>\n`;
        html += `      </tr>\n`;
      });
      
      // Fila de totales
      html += `      <tr class="total-row">\n`;
      html += `        <td class="sala-col">TOTAL POR DÍA</td>\n`;
      
      days.forEach(day => {
        const total = dayTotals[day] || '';
        html += `        <td>${total || '-'}</td>\n`;
      });
      
      const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + val, 0);
      html += `        <td>${grandTotal}</td>\n`;
      html += `      </tr>\n`;
      
      html += `    </tbody>\n  </table>\n</body>\n</html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-calendario-${userName.replace(/\s+/g, '-')}-${myProductionMonth}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    return (
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">📅 Reporte Calendario Individual</h2>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm font-semibold"
          >
            {showCalendar ? '📊 Ver Lista' : '📅 Ver Calendario'}
          </button>
        </div>
        
        <div className="mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input
              type="month"
              value={myProductionMonth}
              onChange={(e) => setMyProductionMonth(e.target.value)}
              className="px-4 py-2 border border-cyan-200 rounded-lg w-full"
            />
          </div>
          {showCalendar && (
            <button
              onClick={exportCalendarToPDF}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold whitespace-nowrap"
            >
              📑 Exportar PDF
            </button>
          )}
        </div>
        
        {showCalendar ? (
          <div className="bg-white rounded-lg p-4 overflow-x-auto">
            <div className="mb-4 pb-3">
              <div className="border-t-2 border-b-2 border-cyan-600 py-3 mb-3 space-y-1">
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Red Asistencial:</strong> Sabogal
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Departamento:</strong> Ayuda al Diagnóstico y Tratamiento
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Servicio:</strong> Radiodiagnóstico y Ecografía
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Especialidad:</strong> Radiología
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Cargo:</strong> Tecnólogo Médico
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Usuario:</strong> {userFullNames[currentUser] || currentUser}
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">DNI:</strong> {currentUser}
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Mes:</strong> {monthName}
                </div>
              </div>
            </div>
            
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="bg-cyan-700 text-white p-2 border border-cyan-800 text-left sticky left-0 z-10 min-w-[180px]">
                    Sala / Turno
                  </th>
                  {days.map(day => (
                    <th key={day} className="bg-cyan-700 text-white p-2 border border-cyan-800 min-w-[35px]">
                      {day}
                    </th>
                  ))}
                  <th className="bg-blue-800 text-white p-2 border border-blue-900 font-bold min-w-[50px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(matrix).map(([key, dayData]) => (
                  <tr key={key} className="hover:bg-cyan-50">
                    <td className="bg-gray-50 font-semibold p-2 border border-gray-300 text-left sticky left-0 z-10">
                      {key}
                    </td>
                    {days.map(day => {
                      const value = dayData[day];
                      return (
                        <td 
                          key={day} 
                          className={`p-2 border border-gray-300 text-center ${
                            value ? 'bg-green-100 font-bold text-green-800' : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          {value || '-'}
                        </td>
                      );
                    })}
                    <td className="bg-blue-100 font-bold text-blue-800 p-2 border border-blue-300 text-center">
                      {rowTotals[key]}
                    </td>
                  </tr>
                ))}
                
                <tr className="bg-yellow-100">
                  <td className="font-bold p-2 border border-gray-300 text-left sticky left-0 z-10">
                    TOTAL POR DÍA
                  </td>
                  {days.map(day => {
                    const total = dayTotals[day];
                    return (
                      <td 
                        key={day} 
                        className={`p-2 border border-gray-300 text-center font-bold ${
                          total ? 'text-amber-800' : 'text-gray-400'
                        }`}
                      >
                        {total || '-'}
                      </td>
                    );
                  })}
                  <td className="bg-amber-200 font-bold text-amber-900 p-2 border border-amber-400 text-center text-base">
                    {Object.values(rowTotals).reduce((sum, val) => sum + val, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  }
  
  function CalendarTable({ userId, reportMonth, productions }) {
    // Filtrar producción del usuario específico
    const filtered = productions.filter(p => p.user === userId);
    
    if (filtered.length === 0) {
      return <p className="text-gray-500 text-sm text-center py-2">Sin registros</p>;
    }
    
    // Obtener días del mes
    const [year, month] = reportMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    // Crear estructura: { "Sala/Turno": { día: cantidad } }
    const matrix = {};
    
    filtered.forEach(p => {
      const day = parseInt(p.date.split('-')[2]);
      const key = `${p.sala} / ${p.turno}`;
      
      if (!matrix[key]) {
        matrix[key] = {};
      }
      
      matrix[key][day] = (matrix[key][day] || 0) + Number(p.cantidad);
    });
    
    // Ordenar las filas por turno (Mañana, Tarde, Diurno, Noche)
    const turnoOrder = { 'Mañana': 1, 'Tarde': 2, 'Diurno': 3, 'Noche': 4 };
    const sortedMatrix = {};
    
    Object.keys(matrix).sort((a, b) => {
      const turnoA = a.split(' / ')[1];
      const turnoB = b.split(' / ')[1];
      const orderA = turnoOrder[turnoA] || 5;
      const orderB = turnoOrder[turnoB] || 5;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.localeCompare(b);
    }).forEach(key => {
      sortedMatrix[key] = matrix[key];
    });
    
    // Calcular totales por día
    const dayTotals = {};
    Object.values(sortedMatrix).forEach(dayData => {
      Object.entries(dayData).forEach(([day, cantidad]) => {
        dayTotals[day] = (dayTotals[day] || 0) + cantidad;
      });
    });
    
    // Calcular totales por fila
    const rowTotals = {};
    Object.entries(sortedMatrix).forEach(([key, dayData]) => {
      rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0);
    });
    
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-cyan-700 text-white p-2 border border-cyan-800 text-left sticky left-0 z-10 min-w-[140px] text-[10px]">
                Sala / Turno
              </th>
              {days.map(day => (
                <th key={day} className="bg-cyan-700 text-white p-1 border border-cyan-800 min-w-[28px] text-[9px]">
                  {day}
                </th>
              ))}
              <th className="bg-blue-800 text-white p-2 border border-blue-900 font-bold min-w-[45px] text-[10px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sortedMatrix).map(([key, dayData]) => (
              <tr key={key} className="hover:bg-cyan-50">
                <td className="bg-gray-50 font-semibold p-2 border border-gray-300 text-left sticky left-0 z-10 text-[9px]">
                  {key}
                </td>
                {days.map(day => {
                  const value = dayData[day];
                  return (
                    <td 
                      key={day} 
                      className={`p-1 border border-gray-300 text-center text-[9px] ${
                        value ? 'bg-green-100 font-bold text-green-800' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {value || '-'}
                    </td>
                  );
                })}
                <td className="bg-blue-100 font-bold text-blue-800 p-2 border border-blue-300 text-center text-[10px]">
                  {rowTotals[key]}
                </td>
              </tr>
            ))}
            
            <tr className="bg-yellow-100">
              <td className="font-bold p-2 border border-gray-300 text-left sticky left-0 z-10 text-[9px]">
                TOTAL DÍA
              </td>
              {days.map(day => {
                const total = dayTotals[day];
                return (
                  <td 
                    key={day} 
                    className={`p-1 border border-gray-300 text-center font-bold text-[9px] ${
                      total ? 'text-amber-800' : 'text-gray-400'
                    }`}
                  >
                    {total || '-'}
                  </td>
                );
              })}
              <td className="bg-amber-200 font-bold text-amber-900 p-2 border border-amber-400 text-center text-[11px]">
                {Object.values(rowTotals).reduce((sum, val) => sum + val, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  function ReportSection({ reportMonth, setReportMonth, report, userFullNames, items, exportToTXT, exportToPDF, isAdmin, currentUser }) {
    return (
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Reporte Mensual</h2>
          <div className="flex gap-2">
            <button
              onClick={exportToTXT}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              📄 Exportar TXT
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              📑 Exportar PDF
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="px-4 py-2 border border-purple-200 rounded-lg"
          />
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="mb-4 p-4 bg-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{report.totalGeneral}</div>
            <div className="text-sm text-purple-600">Total General ({report.recordCount} registros)</div>
          </div>
          
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-3">Totales por Turno</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Diurno</div>
                <div className="text-xl font-bold text-green-700">{report.byTurno.Diurno}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Mañana</div>
                <div className="text-xl font-bold text-blue-700">{report.byTurno.Mañana}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Tarde</div>
                <div className="text-xl font-bold text-orange-700">{report.byTurno.Tarde}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Noche</div>
                <div className="text-xl font-bold text-indigo-700">{report.byTurno.Noche}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-4 border-2 border-purple-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Totales por Sala</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {items.map(item => (
                report.bySala[item] > 0 && (
                  <div key={item} className="p-2 bg-purple-50 rounded">
                    <div className="text-xs text-gray-600">{item}</div>
                    <div className="font-semibold text-purple-700">{report.bySala[item]}</div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {Object.values(report.bySopCategory).some(val => val > 0) && (
            <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <h3 className="font-semibold text-gray-800 mb-3">🏥 Totales por Categoría Rx SOP</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (
                  report.bySopCategory[cat] > 0 && (
                    <div key={cat} className="p-2 bg-white rounded border border-orange-200">
                      <div className="text-xs text-gray-600">{cat}</div>
                      <div className="font-semibold text-orange-700">{report.bySopCategory[cat]}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {Object.keys(report.byRxEspecial).length > 0 && (
            <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-semibold text-gray-800 mb-3">🔬 Totales de Exámenes Especiales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(report.byRxEspecial).map(([examen, total]) => (
                  <div key={examen} className="p-2 bg-white rounded border border-blue-200">
                    <div className="text-xs text-gray-600">{examen}</div>
                    <div className="font-semibold text-blue-700">{total}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <h3 className="font-semibold text-gray-800 mb-3">Detalle por Usuario</h3>
          {Object.entries(report.byUser)
            .filter(([user]) => isAdmin || user === currentUser) // Solo mostrar el usuario actual si no es admin
            .map(([user, data]) => {
            const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0);
            return (
            <div key={user} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-800 mb-2">{userFullNames[user] || user}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="font-semibold text-gray-800">{data.total}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Horas trabajadas</div>
                  <div className="font-semibold text-gray-800">{data.horasTrabajadas}h</div>
                </div>
              </div>
              
              <div className="mt-3">
                <CalendarTable 
                  userId={user}
                  reportMonth={reportMonth}
                  productions={report.productions}
                />
              </div>
              
              {userSopTotal > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs font-semibold text-orange-800 mb-2">🏥 Rx SOP por categoría:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (
                      data.sopCategories[cat] > 0 && (
                        <div key={cat} className="flex justify-between items-center">
                          <span className="text-gray-600">{cat}:</span>
                          <span className="font-semibold text-orange-700">{data.sopCategories[cat]}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-semibold text-blue-800 mb-2">🔬 Exámenes Especiales:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => (
                      <div key={examen} className="flex justify-between items-center">
                        <span className="text-gray-600">{examen}:</span>
                        <span className="font-semibold text-blue-700">{cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )})}
          
          
          {Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser).length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay datos para este mes</p>
          )}
        </div>
      </div>
    );
  }
  
     const success = onSubmit(date, sala, turno, cantidad, sopCategory, null, procedimientos, productionNotes);
     if (success) {
    setSala('');
    setTurno('');
    setCantidad('');
    setSopCategory('');
    setProcedimientos([{ nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }]);
    setProductionNotes('');  
  }
};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={currentUser}
              disabled
              className="w-full px-4 py-2 border border-green-200 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <select
              value={sala}
              onChange={(e) => {
                setSala(e.target.value);
                setSopCategory('');
                setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]);
              }}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar sala</option>
              {items.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          
          {sala === 'Rx Sop' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Rx SOP</label>
              <select
                value={sopCategory}
                onChange={(e) => setSopCategory(e.target.value)}
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              >
                <option value="">Seleccionar categoría</option>
                {sopCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar turno</option>
              <option value="Diurno">Diurno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>
          
    {sala !== 'Rx especiales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              />
            </div>
          )}
        </div>  
    {sala === 'Rx especiales' && (
         <div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Exámenes Especiales Realizados</h3>
      {rxEspeciales.map((esp, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Examen {index + 1}</label>
            <input
              type="text"
              value={esp.examen}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].examen = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="Nombre del examen"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={esp.cantidad}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].cantidad = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-green-50 p-4 rounded-lg mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🏥 Procedimientos Realizados</h3>
      {procedimientos.map((proc, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Procedimiento {index + 1}</label>
            <input
              type="text"
              value={proc.nombre}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].nombre = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="Nombre del procedimiento"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={proc.cantidad}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].cantidad = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)}

            {!isAdmin && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Mi Producción del Mes</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                <input
                  type="month"
                  value={myProductionMonth}
                  onChange={(e) => setMyProductionMonth(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-lg"
                />
              </div>
              
              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                {getMyProductions().length > 0 ? (
                  <div className="space-y-2">
                    {getMyProductions().map(prod => (
                      <div key={prod.id} className="border border-purple-200 rounded-lg p-3 hover:bg-purple-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {prod.date.split('-').reverse().join('/')} - {prod.turno}
                            </div>
                            <div className="text-sm text-gray-600">{prod.sala}</div>
                            {prod.rxEspecialExamen && (
                              <div className="text-xs text-blue-600">Examen: {prod.rxEspecialExamen}</div>
                            )}
                            {prod.sopCategory && (
                              <div className="text-xs text-orange-600">Categoría: {prod.sopCategory}</div>
                            )}
                            <div className="text-lg font-bold text-purple-700">Cantidad: {prod.cantidad}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProduction(prod)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deleteProduction(prod.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <div className="text-sm font-semibold text-purple-800">
                        Total: {getMyProductions().reduce((sum, p) => sum + Number(p.cantidad), 0)}
                      </div>
                      <div className="text-xs text-purple-600">{getMyProductions().length} registro(s)</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay registros para este mes</p>
                )}
              </div>
            </div>
            )}

            {!isAdmin && (
            <CalendarReport 
              currentUser={currentUser}
              userFullNames={userFullNames}
              productions={productions}
              myProductionMonth={myProductionMonth}
              setMyProductionMonth={setMyProductionMonth}
            />
            )}

            {!isAdmin && (
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
            )}
          </div>
        </div>
      </div>
    );
  }
  
  function CalendarReport({ currentUser, userFullNames, productions, myProductionMonth, setMyProductionMonth }) {
    const [showCalendar, setShowCalendar] = useState(false);
    
    const generateCalendarData = () => {
      // Filtrar producción del usuario y mes actual
      const filtered = productions.filter(p => 
        p.user === currentUser && p.date.startsWith(myProductionMonth)
      );

      const [year, month] = myProductionMonth.split('-');
      
      if (filtered.length === 0) return null;
      
      // Obtener días del mes
      const [yearCal, monthCal] = myProductionMonth.split('-');
      const daysInMonth = new Date(yearCal, monthCal, 0).getDate();
      const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
      
      // Crear estructura: { "Sala/Turno": { día: cantidad } }
      const matrix = {};
      
      filtered.forEach(p => {
        const day = parseInt(p.date.split('-')[2]);
        const key = `${p.sala} / ${p.turno}`;
        
        if (!matrix[key]) {
          matrix[key] = {};
        }
        
        matrix[key][day] = (matrix[key][day] || 0) + Number(p.cantidad);
      });
      
      // Ordenar las filas por turno (Mañana, Tarde, Diurno, Noche)
      const turnoOrder = { 'Mañana': 1, 'Tarde': 2, 'Diurno': 3, 'Noche': 4 };
      const sortedMatrix = {};
      
      Object.keys(matrix).sort((a, b) => {
        const turnoA = a.split(' / ')[1];
        const turnoB = b.split(' / ')[1];
        const orderA = turnoOrder[turnoA] || 5;
        const orderB = turnoOrder[turnoB] || 5;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Si es el mismo turno, ordenar por sala alfabéticamente
        return a.localeCompare(b);
      }).forEach(key => {
        sortedMatrix[key] = matrix[key];
      });
      
      return { matrix: sortedMatrix, days };
    };
    
    const data = generateCalendarData();
    
    if (!data) {
      return (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Reporte Calendario Individual</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input
              type="month"
              value={myProductionMonth}
              onChange={(e) => setMyProductionMonth(e.target.value)}
              className="px-4 py-2 border border-cyan-200 rounded-lg"
            />
          </div>
          <p className="text-gray-500 text-center py-8">No hay registros para este mes</p>
        </div>
      );
    }
    
    const { matrix, days } = data;
    const monthName = new Date(myProductionMonth + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    
    // Calcular totales por día
    const dayTotals = {};
    Object.values(matrix).forEach(dayData => {
      Object.entries(dayData).forEach(([day, cantidad]) => {
        dayTotals[day] = (dayTotals[day] || 0) + cantidad;
      });
    });
    
    // Calcular totales por fila
    const rowTotals = {};
    Object.entries(matrix).forEach(([key, dayData]) => {
      rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0);
    });
    
    const exportCalendarToPDF = () => {
      const userName = userFullNames[currentUser] || currentUser;
      
      let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Reporte Calendario - ${userName}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        margin: 20px;
        font-size: 11px;
      }
      h1 { 
        color: #1e40af; 
        text-align: center;
        margin-bottom: 10px;
      }
      h2 {
        color: #059669;
        text-align: center;
        margin-top: 0;
        font-size: 16px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 20px 0;
        font-size: 10px;
      }
      th { 
        background: #1e40af; 
        color: white; 
        padding: 8px 4px; 
        text-align: center;
        border: 1px solid #1e3a8a;
        font-size: 9px;
      }
      td { 
        padding: 6px 4px; 
        border: 1px solid #cbd5e1;
        text-align: center;
      }
      .sala-col {
        background: #f1f5f9;
        font-weight: bold;
        text-align: left;
        padding-left: 8px;
        max-width: 180px;
        font-size: 9px;
      }
      .total-col {
        background: #dbeafe;
        font-weight: bold;
        color: #1e40af;
      }
      .total-row td {
        background: #fef3c7;
        font-weight: bold;
        color: #92400e;
      }
      .has-value {
        background: #dcfce7;
        font-weight: bold;
        color: #166534;
      }
      .empty {
        background: #f9fafb;
        color: #9ca3af;
      }
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        z-index: 1000;
      }
      @media print {
        .print-button { display: none; }
        body { margin: 0; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <button class="print-button" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    
    <h1 style="text-align: center; color: #1e40af; margin-bottom: 20px;">📅 REPORTE CALENDARIO DE PRODUCCIÓN</h1>
    
    <div style="border-top: 3px solid #0284c7; border-bottom: 3px solid #0284c7; padding: 15px 10px; margin: 20px 0; line-height: 1.8;">
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Red Asistencial:</strong> Sabogal
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Departamento:</strong> Ayuda al Diagnóstico y Tratamiento
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Servicio:</strong> Radiodiagnóstico y Ecografía
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Especialidad:</strong> Radiología
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Cargo:</strong> Tecnólogo Médico
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">Usuario:</strong> ${userName}
      </div>
      <div style="margin-bottom: 6px; font-size: 12px;">
        <strong style="color: #0369a1;">DNI:</strong> ${currentUser}
      </div>
      <div style="font-size: 12px;">
        <strong style="color: #0369a1;">Mes:</strong> ${monthName}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th class="sala-col">Sala / Turno</th>
  `;
      
      // Encabezados de días
      days.forEach(day => {
        html += `        <th>${day}</th>\n`;
      });
      html += `        <th class="total-col">Total</th>\n`;
      html += `      </tr>\n    </thead>\n    <tbody>\n`;
      
      // Filas de datos
      Object.entries(matrix).forEach(([key, dayData]) => {
        html += `      <tr>\n`;
        html += `        <td class="sala-col">${key}</td>\n`;
        
        days.forEach(day => {
          const value = dayData[day] || '';
          const className = value ? 'has-value' : 'empty';
          html += `        <td class="${className}">${value || '-'}</td>\n`;
        });
        
        html += `        <td class="total-col">${rowTotals[key]}</td>\n`;
        html += `      </tr>\n`;
      });
      
      // Fila de totales
      html += `      <tr class="total-row">\n`;
      html += `        <td class="sala-col">TOTAL POR DÍA</td>\n`;
      
      days.forEach(day => {
        const total = dayTotals[day] || '';
        html += `        <td>${total || '-'}</td>\n`;
      });
      
      const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + val, 0);
      html += `        <td>${grandTotal}</td>\n`;
      html += `      </tr>\n`;
      
      html += `    </tbody>\n  </table>\n</body>\n</html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-calendario-${userName.replace(/\s+/g, '-')}-${myProductionMonth}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    return (
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">📅 Reporte Calendario Individual</h2>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm font-semibold"
          >
            {showCalendar ? '📊 Ver Lista' : '📅 Ver Calendario'}
          </button>
        </div>
        
        <div className="mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input
              type="month"
              value={myProductionMonth}
              onChange={(e) => setMyProductionMonth(e.target.value)}
              className="px-4 py-2 border border-cyan-200 rounded-lg w-full"
            />
          </div>
          {showCalendar && (
            <button
              onClick={exportCalendarToPDF}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold whitespace-nowrap"
            >
              📑 Exportar PDF
            </button>
          )}
        </div>
        
        {showCalendar ? (
          <div className="bg-white rounded-lg p-4 overflow-x-auto">
            <div className="mb-4 pb-3">
              <div className="border-t-2 border-b-2 border-cyan-600 py-3 mb-3 space-y-1">
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Red Asistencial:</strong> Sabogal
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Centro Asistencial:</strong> Hospital Alberto Sabogal Sologuren
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Departamento:</strong> Ayuda al Diagnóstico y Tratamiento
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Servicio:</strong> Radiodiagnóstico y Ecografía
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Especialidad:</strong> Radiología
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Cargo:</strong> Tecnólogo Médico
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Usuario:</strong> {userFullNames[currentUser] || currentUser}
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">DNI:</strong> {currentUser}
                </div>
                <div className="text-sm text-gray-700">
                  <strong className="text-cyan-800">Mes:</strong> {monthName}
                </div>
              </div>
            </div>
            
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="bg-cyan-700 text-white p-2 border border-cyan-800 text-left sticky left-0 z-10 min-w-[180px]">
                    Sala / Turno
                  </th>
                  {days.map(day => (
                    <th key={day} className="bg-cyan-700 text-white p-2 border border-cyan-800 min-w-[35px]">
                      {day}
                    </th>
                  ))}
                  <th className="bg-blue-800 text-white p-2 border border-blue-900 font-bold min-w-[50px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(matrix).map(([key, dayData]) => (
                  <tr key={key} className="hover:bg-cyan-50">
                    <td className="bg-gray-50 font-semibold p-2 border border-gray-300 text-left sticky left-0 z-10">
                      {key}
                    </td>
                    {days.map(day => {
                      const value = dayData[day];
                      return (
                        <td 
                          key={day} 
                          className={`p-2 border border-gray-300 text-center ${
                            value ? 'bg-green-100 font-bold text-green-800' : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          {value || '-'}
                        </td>
                      );
                    })}
                    <td className="bg-blue-100 font-bold text-blue-800 p-2 border border-blue-300 text-center">
                      {rowTotals[key]}
                    </td>
                  </tr>
                ))}
                
                <tr className="bg-yellow-100">
                  <td className="font-bold p-2 border border-gray-300 text-left sticky left-0 z-10">
                    TOTAL POR DÍA
                  </td>
                  {days.map(day => {
                    const total = dayTotals[day];
                    return (
                      <td 
                        key={day} 
                        className={`p-2 border border-gray-300 text-center font-bold ${
                          total ? 'text-amber-800' : 'text-gray-400'
                        }`}
                      >
                        {total || '-'}
                      </td>
                    );
                  })}
                  <td className="bg-amber-200 font-bold text-amber-900 p-2 border border-amber-400 text-center text-base">
                    {Object.values(rowTotals).reduce((sum, val) => sum + val, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  }
  
  function CalendarTable({ userId, reportMonth, productions }) {
    // Filtrar producción del usuario específico
    const filtered = productions.filter(p => p.user === userId);
    
    if (filtered.length === 0) {
      return <p className="text-gray-500 text-sm text-center py-2">Sin registros</p>;
    }
    
    // Obtener días del mes
    const [year, month] = reportMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    // Crear estructura: { "Sala/Turno": { día: cantidad } }
    const matrix = {};
    
    filtered.forEach(p => {
      const day = parseInt(p.date.split('-')[2]);
      const key = `${p.sala} / ${p.turno}`;
      
      if (!matrix[key]) {
        matrix[key] = {};
      }
      
      matrix[key][day] = (matrix[key][day] || 0) + Number(p.cantidad);
    });
    
    // Ordenar las filas por turno (Mañana, Tarde, Diurno, Noche)
    const turnoOrder = { 'Mañana': 1, 'Tarde': 2, 'Diurno': 3, 'Noche': 4 };
    const sortedMatrix = {};
    
    Object.keys(matrix).sort((a, b) => {
      const turnoA = a.split(' / ')[1];
      const turnoB = b.split(' / ')[1];
      const orderA = turnoOrder[turnoA] || 5;
      const orderB = turnoOrder[turnoB] || 5;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.localeCompare(b);
    }).forEach(key => {
      sortedMatrix[key] = matrix[key];
    });
    
    // Calcular totales por día
    const dayTotals = {};
    Object.values(sortedMatrix).forEach(dayData => {
      Object.entries(dayData).forEach(([day, cantidad]) => {
        dayTotals[day] = (dayTotals[day] || 0) + cantidad;
      });
    });
    
    // Calcular totales por fila
    const rowTotals = {};
    Object.entries(sortedMatrix).forEach(([key, dayData]) => {
      rowTotals[key] = Object.values(dayData).reduce((sum, val) => sum + val, 0);
    });
    
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-cyan-700 text-white p-2 border border-cyan-800 text-left sticky left-0 z-10 min-w-[140px] text-[10px]">
                Sala / Turno
              </th>
              {days.map(day => (
                <th key={day} className="bg-cyan-700 text-white p-1 border border-cyan-800 min-w-[28px] text-[9px]">
                  {day}
                </th>
              ))}
              <th className="bg-blue-800 text-white p-2 border border-blue-900 font-bold min-w-[45px] text-[10px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sortedMatrix).map(([key, dayData]) => (
              <tr key={key} className="hover:bg-cyan-50">
                <td className="bg-gray-50 font-semibold p-2 border border-gray-300 text-left sticky left-0 z-10 text-[9px]">
                  {key}
                </td>
                {days.map(day => {
                  const value = dayData[day];
                  return (
                    <td 
                      key={day} 
                      className={`p-1 border border-gray-300 text-center text-[9px] ${
                        value ? 'bg-green-100 font-bold text-green-800' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {value || '-'}
                    </td>
                  );
                })}
                <td className="bg-blue-100 font-bold text-blue-800 p-2 border border-blue-300 text-center text-[10px]">
                  {rowTotals[key]}
                </td>
              </tr>
            ))}
            
            <tr className="bg-yellow-100">
              <td className="font-bold p-2 border border-gray-300 text-left sticky left-0 z-10 text-[9px]">
                TOTAL DÍA
              </td>
              {days.map(day => {
                const total = dayTotals[day];
                return (
                  <td 
                    key={day} 
                    className={`p-1 border border-gray-300 text-center font-bold text-[9px] ${
                      total ? 'text-amber-800' : 'text-gray-400'
                    }`}
                  >
                    {total || '-'}
                  </td>
                );
              })}
              <td className="bg-amber-200 font-bold text-amber-900 p-2 border border-amber-400 text-center text-[11px]">
                {Object.values(rowTotals).reduce((sum, val) => sum + val, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  function ReportSection({ reportMonth, setReportMonth, report, userFullNames, items, exportToTXT, exportToPDF, isAdmin, currentUser }) {
    return (
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Reporte Mensual</h2>
          <div className="flex gap-2">
            <button
              onClick={exportToTXT}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              📄 Exportar TXT
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              📑 Exportar PDF
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="px-4 py-2 border border-purple-200 rounded-lg"
          />
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="mb-4 p-4 bg-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{report.totalGeneral}</div>
            <div className="text-sm text-purple-600">Total General ({report.recordCount} registros)</div>
          </div>
          
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-3">Totales por Turno</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Diurno</div>
                <div className="text-xl font-bold text-green-700">{report.byTurno.Diurno}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Mañana</div>
                <div className="text-xl font-bold text-blue-700">{report.byTurno.Mañana}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Tarde</div>
                <div className="text-xl font-bold text-orange-700">{report.byTurno.Tarde}</div>
              </div>
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Noche</div>
                <div className="text-xl font-bold text-indigo-700">{report.byTurno.Noche}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-4 border-2 border-purple-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Totales por Sala</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {items.map(item => (
                report.bySala[item] > 0 && (
                  <div key={item} className="p-2 bg-purple-50 rounded">
                    <div className="text-xs text-gray-600">{item}</div>
                    <div className="font-semibold text-purple-700">{report.bySala[item]}</div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {Object.values(report.bySopCategory).some(val => val > 0) && (
            <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <h3 className="font-semibold text-gray-800 mb-3">🏥 Totales por Categoría Rx SOP</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (
                  report.bySopCategory[cat] > 0 && (
                    <div key={cat} className="p-2 bg-white rounded border border-orange-200">
                      <div className="text-xs text-gray-600">{cat}</div>
                      <div className="font-semibold text-orange-700">{report.bySopCategory[cat]}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {Object.keys(report.byRxEspecial).length > 0 && (
            <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-semibold text-gray-800 mb-3">🔬 Totales de Exámenes Especiales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(report.byRxEspecial).map(([examen, total]) => (
                  <div key={examen} className="p-2 bg-white rounded border border-blue-200">
                    <div className="text-xs text-gray-600">{examen}</div>
                    <div className="font-semibold text-blue-700">{total}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <h3 className="font-semibold text-gray-800 mb-3">Detalle por Usuario</h3>
          {Object.entries(report.byUser)
            .filter(([user]) => isAdmin || user === currentUser) // Solo mostrar el usuario actual si no es admin
            .map(([user, data]) => {
            const userSopTotal = Object.values(data.sopCategories || {}).reduce((sum, val) => sum + val, 0);
            return (
            <div key={user} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-800 mb-2">{userFullNames[user] || user}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="font-semibold text-gray-800">{data.total}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Horas trabajadas</div>
                  <div className="font-semibold text-gray-800">{data.horasTrabajadas}h</div>
                </div>
              </div>
              
              <div className="mt-3">
                <CalendarTable 
                  userId={user}
                  reportMonth={reportMonth}
                  productions={report.productions}
                />
              </div>
              
              {userSopTotal > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs font-semibold text-orange-800 mb-2">🏥 Rx SOP por categoría:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {['Urologia', 'Columna neuro', 'Panangiografia cerebral', 'Cirugia pediatrica', 'Traumatologia', 'Terapia del dolor', 'Marcapaso', 'Hemodinamia', 'Cirugia general', 'Otro'].map(cat => (
                      data.sopCategories[cat] > 0 && (
                        <div key={cat} className="flex justify-between items-center">
                          <span className="text-gray-600">{cat}:</span>
                          <span className="font-semibold text-orange-700">{data.sopCategories[cat]}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {Object.keys(data.rxEspeciales || {}).length > 0 && Object.values(data.rxEspeciales).reduce((sum, val) => sum + val, 0) > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-semibold text-blue-800 mb-2">🔬 Exámenes Especiales:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(data.rxEspeciales).filter(([, cant]) => cant > 0).map(([examen, cantidad]) => (
                      <div key={examen} className="flex justify-between items-center">
                        <span className="text-gray-600">{examen}:</span>
                        <span className="font-semibold text-blue-700">{cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )})}
          
          
          {Object.entries(report.byUser).filter(([user]) => isAdmin || user === currentUser).length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay datos para este mes</p>
          )}
        </div>
      </div>
    );
  }
  
     const success = onSubmit(date, sala, turno, cantidad, sopCategory, null, procedimientos, productionNotes);
     if (success) {
    setSala('');
    setTurno('');
    setCantidad('');
    setSopCategory('');
    setProcedimientos([{ nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }, { nombre: '', cantidad: '' }]);
    setProductionNotes('');  
  }
};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={currentUser}
              disabled
              className="w-full px-4 py-2 border border-green-200 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <select
              value={sala}
              onChange={(e) => {
                setSala(e.target.value);
                setSopCategory('');
                setRxEspeciales([{ examen: '', cantidad: '' }, { examen: '', cantidad: '' }, { examen: '', cantidad: '' }]);
              }}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar sala</option>
              {items.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          
          {sala === 'Rx Sop' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Rx SOP</label>
              <select
                value={sopCategory}
                onChange={(e) => setSopCategory(e.target.value)}
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              >
                <option value="">Seleccionar categoría</option>
                {sopCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg"
            >
              <option value="">Seleccionar turno</option>
              <option value="Diurno">Diurno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>
          
    {sala !== 'Rx especiales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-green-200 rounded-lg"
              />
            </div>
          )}
        </div>  
    {sala === 'Rx especiales' && (
         <div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Exámenes Especiales Realizados</h3>
      {rxEspeciales.map((esp, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Examen {index + 1}</label>
            <input
              type="text"
              value={esp.examen}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].examen = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="Nombre del examen"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={esp.cantidad}
              onChange={(e) => {
                const newEsp = [...rxEspeciales];
                newEsp[index].cantidad = e.target.value;
                setRxEspeciales(newEsp);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-green-50 p-4 rounded-lg mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🏥 Procedimientos Realizados</h3>
      {procedimientos.map((proc, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Procedimiento {index + 1}</label>
            <input
              type="text"
              value={proc.nombre}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].nombre = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="Nombre del procedimiento"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
            <input
              type="number"
              value={proc.cantidad}
              onChange={(e) => {
                const newProc = [...procedimientos];
                newProc[index].cantidad = e.target.value;
                setProcedimientos(newProc);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {/* Campo de Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📝 Notas / Observaciones (opcional)
          </label>
          <textarea
            value={productionNotes}
            onChange={(e) => setProductionNotes(e.target.value)}
            placeholder="Ej: Paciente pediátrico, urgencia, estudio especial..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="2"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Registrar Producción
        </button>
      </div>
    );
  }

}

export default App;
