import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppData, Dataset, User, ActivityLog } from './types';
import { GeneralInfoForm } from './components/GeneralInfoForm';
import { StudentsForm } from './components/StudentsForm';
import { ScoresForm } from './components/ScoresForm';
import { AttributesForm } from './components/AttributesForm';
import { Attributes5_8Form } from './components/Attributes5_8Form';
import { AnalyticalForm } from './components/AnalyticalForm';
import { IndicatorsForm } from './components/IndicatorsForm';
import { Instructions1Form } from './components/Instructions1Form';
import { Instructions2Form } from './components/Instructions2Form';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { exportToExcel } from './utils/excelExport';
import { Download, FileSpreadsheet, Settings, X, Cloud, CloudOff, CloudUpload, CheckCircle2, AlertCircle, Loader2, LogOut, ArrowLeft, User as UserIcon, Clock, Pencil, Trash2, RefreshCw } from 'lucide-react';

const initialData: AppData = {
  generalInfo: {
    gradeLevel: 'ม.3/1',
    semester: '1',
    academicYear: '2568',
    subjectCode: 'ว32102',
    subjectName: 'วิทยาการคำนวณ',
    learningArea: 'วิทยาศาสตร์และเทคโนโลยี',
    totalHours: '1',
    hoursPerWeek: '20',
    hoursPerSemester: '20',
    teacherName: 'นางประนอมจิตร หอมบุญ',
    teacherName2: '',
    homeroomTeacher1: 'นางภัทราวดี พิณะเวศน์',
    homeroomTeacher2: 'นายชินวัตร แก้วกาหนัน',
    homeroomTeachers: '1. นางภัทราวดี พิณะเวศน์ 2. นายชินวัตร แก้วกาหนัน',
    headOfLearningArea: 'นางสาววันวิสา พลหมอ',
    headOfEvaluation: 'นางสาวประภาวดี ศรีทับ',
    deputyDirector: 'นางสาวอัจฉราภรณ์ เศษวิ',
    schoolDirector: 'นายมีเกียรติ นาสมตรึก',
    approvalDate: new Date().toISOString().split('T')[0],
  },
  students: [],
  attendance: {},
  scores: {},
  attributes: {},
  analytical: {},
  indicators: [],
};

// Smart Merge function to prevent data loss from concurrent edits
function mergeEntities<T extends { id: string }>(
  local: T[],
  saved: T[],
  server: T[]
): T[] {
  if (local === saved) return server;

  const modified = local.filter(lItem => {
    const sItem = saved.find(s => s.id === lItem.id);
    return !sItem || JSON.stringify(lItem) !== JSON.stringify(sItem);
  });
  
  const deletedIds = saved.filter(s => !local.find(l => l.id === s.id)).map(s => s.id);

  let merged = [...server];
  merged = merged.filter(item => !deletedIds.includes(item.id));
  
  modified.forEach(mItem => {
    const index = merged.findIndex(item => item.id === mItem.id);
    if (index >= 0) {
      merged[index] = mItem;
    } else {
      merged.push(mItem);
    }
  });

  return merged;
}

const tabs = [
  { id: 'general', label: 'ปก' },
  { id: 'students', label: 'ชื่อ+เวลา1+เวลา2' },
  { id: 'scores', label: 'คะแนนรายตัวชี้วัด1+2' },
  { id: 'attributes1_4', label: 'คุณลักษณะ1-4' },
  { id: 'attributes5_8', label: 'คุณลักษณะ5-8' },
  { id: 'analytical', label: 'คิดวิเคราะห์' },
  { id: 'indicators', label: 'ตัวชี้วัด' },
  { id: 'instructions1', label: 'คำชี้แจง1' },
  { id: 'instructions2', label: 'คำชี้แจง2' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<'database' | 'approvals' | 'users' | 'logs'>('database');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [webAppUrl, setWebAppUrl] = useState<string>('https://script.google.com/macros/s/AKfycbwLDChDwf9m17IqnwbmzryVIHIluvQNIA9eMpOKAQlviz-QwnGw7gFf8hFosfdxkhNu/exec');
  const [tempUrl, setTempUrl] = useState('https://script.google.com/macros/s/AKfycbwLDChDwf9m17IqnwbmzryVIHIluvQNIA9eMpOKAQlviz-QwnGw7gFf8hFosfdxkhNu/exec');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', password: '' });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFirstLoad = useRef(true);
  const latestDatasets = useRef<Dataset[]>([]);
  const lastSavedDatasets = useRef<Dataset[]>([]);
  const latestUsers = useRef<User[]>([]);
  const lastSavedUsers = useRef<User[]>([]);
  const latestActivityLogs = useRef<ActivityLog[]>([]);
  const lastSavedActivityLogs = useRef<ActivityLog[]>([]);
  const latestNotifications = useRef<any[]>([]);
  const lastSavedNotifications = useRef<any[]>([]);
  const isSaving = useRef(false);

  useEffect(() => {
    latestDatasets.current = datasets;
  }, [datasets]);

  useEffect(() => {
    latestUsers.current = users;
  }, [users]);

  useEffect(() => {
    latestActivityLogs.current = activityLogs;
  }, [activityLogs]);

  useEffect(() => {
    latestNotifications.current = notifications;
  }, [notifications]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedUsers = localStorage.getItem('appUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const admin: User = {
        id: 'admin-1',
        name: 'ผู้ดูแลระบบหลัก',
        username: 'admin',
        password: '@Admin123456',
        status: 'approved',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setUsers([admin]);
      localStorage.setItem('appUsers', JSON.stringify([admin]));
    }

    const savedLogs = localStorage.getItem('activityLogs');
    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    }

    const savedNotifications = localStorage.getItem('adminNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedUrl = localStorage.getItem('googleSheetWebAppUrl');
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbwLDChDwf9m17IqnwbmzryVIHIluvQNIA9eMpOKAQlviz-QwnGw7gFf8hFosfdxkhNu/exec';
    const oldUrl1 = 'https://script.google.com/macros/s/AKfycbwS47HhdtHsHPqw-Hx7RjvPIUwMVDqq7qwfGbahvrouQgmWzQWQX-kGzVgFr91wEWUx/exec';
    const oldUrl2 = 'https://script.google.com/macros/s/AKfycbxQznwzrmaZve6pfqFHdbe7ummu9F7B65AYlPH2qptYIr9kgJ9qMpvUAvlUHvJWwa_V/exec';
    
    if (savedUrl && savedUrl !== oldUrl1 && savedUrl !== oldUrl2) {
      setWebAppUrl(savedUrl);
      setTempUrl(savedUrl);
      loadData(savedUrl);
    } else {
      localStorage.setItem('googleSheetWebAppUrl', defaultUrl);
      setWebAppUrl(defaultUrl);
      setTempUrl(defaultUrl);
      loadData(defaultUrl);
    }
  }, []);

  const loadData = async (url: string) => {
    setSyncStatus('loading');
    try {
      const response = await fetch(url);
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.status === 'success' && result.data) {
          // Handle legacy data or new datasets array
          if (Array.isArray(result.data.datasets)) {
            setDatasets(result.data.datasets);
          } else if (result.data.generalInfo) {
            // Legacy data conversion
            setDatasets([{
              id: 'legacy-1',
              name: 'ข้อมูลเดิม',
              academicYear: result.data.generalInfo?.academicYear || '2568',
              semester: result.data.generalInfo?.semester || '1',
              subjectName: result.data.generalInfo?.subjectName || '',
              learningArea: result.data.generalInfo?.learningArea || '',
              gradeLevel: result.data.generalInfo?.gradeLevel || '',
              status: 'not_started',
              data: result.data
            }]);
          }

          if (Array.isArray(result.data.users)) {
            setUsers(result.data.users);
            localStorage.setItem('appUsers', JSON.stringify(result.data.users));
          }
          if (Array.isArray(result.data.activityLogs)) {
            setActivityLogs(result.data.activityLogs);
            localStorage.setItem('activityLogs', JSON.stringify(result.data.activityLogs));
          }
          if (Array.isArray(result.data.notifications)) {
            setNotifications(result.data.notifications);
            localStorage.setItem('adminNotifications', JSON.stringify(result.data.notifications));
          }
        }
        setIsDataLoaded(true);
        setSyncStatus('saved');
      } catch (parseError) {
        console.error('JSON Parse Error from Google Sheet:', parseError);
        console.error('Raw response length:', text.length);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheet: ข้อมูลถูกตัดทอนหรือไม่สมบูรณ์ (อาจเกิดจากข้อจำกัดของ Google Apps Script)');
        setIsDataLoaded(true);
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Load failed:', error);
      setIsDataLoaded(true);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (!isDataLoaded || !webAppUrl) return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      lastSavedDatasets.current = latestDatasets.current;
      lastSavedUsers.current = latestUsers.current;
      lastSavedActivityLogs.current = latestActivityLogs.current;
      lastSavedNotifications.current = latestNotifications.current;
    }

    const saveInterval = setInterval(async () => {
      if (isSaving.current) return;
      
      const localDatasets = latestDatasets.current;
      const savedDatasets = lastSavedDatasets.current;
      const localUsers = latestUsers.current;
      const savedUsers = lastSavedUsers.current;
      const localLogs = latestActivityLogs.current;
      const savedLogs = lastSavedActivityLogs.current;
      const localNotifs = latestNotifications.current;
      const savedNotifs = lastSavedNotifications.current;

      const hasDatasetsChanged = localDatasets !== savedDatasets;
      const hasUsersChanged = localUsers !== savedUsers;
      const hasLogsChanged = localLogs !== savedLogs;
      const hasNotificationsChanged = localNotifs !== savedNotifs;

      if (!hasDatasetsChanged && !hasUsersChanged && !hasLogsChanged && !hasNotificationsChanged) return;

      isSaving.current = true;
      setSyncStatus('saving');
      
      try {
        // 1. Fetch latest from server
        const fetchResponse = await fetch(webAppUrl);
        const fetchText = await fetchResponse.text();
        const serverData = JSON.parse(fetchText).data;

        const serverDatasets = Array.isArray(serverData.datasets) ? serverData.datasets : [];
        const serverUsers = Array.isArray(serverData.users) ? serverData.users : [];
        const serverLogs = Array.isArray(serverData.activityLogs) ? serverData.activityLogs : [];
        const serverNotifs = Array.isArray(serverData.notifications) ? serverData.notifications : [];

        // 2. Smart Merge
        const mergedDatasets = mergeEntities(localDatasets, savedDatasets, serverDatasets);
        const mergedUsers = mergeEntities(localUsers, savedUsers, serverUsers);
        const mergedLogs = mergeEntities(localLogs, savedLogs, serverLogs);
        const mergedNotifs = mergeEntities(localNotifs, savedNotifs, serverNotifs);

        // 3. Save to server
        const response = await fetch(webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({ 
            datasets: mergedDatasets,
            users: mergedUsers,
            activityLogs: mergedLogs,
            notifications: mergedNotifs
          }),
        });

        const text = await response.text();
        try {
          const result = JSON.parse(text);
          if (result.status === 'success') {
            // 4. Update local state with merged data
            lastSavedDatasets.current = mergedDatasets;
            lastSavedUsers.current = mergedUsers;
            lastSavedActivityLogs.current = mergedLogs;
            lastSavedNotifications.current = mergedNotifs;
            
            // Only update React state if there were actual server changes we didn't have
            // to avoid unnecessary re-renders or cursor jumping.
            // For simplicity and safety, we update state.
            setDatasets(mergedDatasets);
            setUsers(mergedUsers);
            setActivityLogs(mergedLogs);
            setNotifications(mergedNotifs);

            setSyncStatus('saved');
          } else {
            throw new Error(result.message);
          }
        } catch (parseError) {
          console.error('JSON Parse Error on Save:', parseError);
          console.error('Raw response length:', text.length);
          throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่สมบูรณ์');
        }
      } catch (error) {
        console.error('Save failed:', error);
        setSyncStatus('error');
      } finally {
        isSaving.current = false;
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [isDataLoaded, webAppUrl]);

  const handleExport = async () => {
    try {
      if (currentDatasetId) {
        const currentDataset = datasets.find(d => d.id === currentDatasetId);
        if (currentDataset) {
          await exportToExcel(currentDataset.data);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์');
    }
  };

  useEffect(() => {
    if (syncStatus === 'saved') {
      const timer = setTimeout(() => setSyncStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleSaveUrl = () => {
    setWebAppUrl(tempUrl);
    localStorage.setItem('googleSheetWebAppUrl', tempUrl);
    setShowSettings(false);
    isFirstLoad.current = true;
    loadData(tempUrl);
  };

  const renderSyncStatus = () => {
    let content = null;
    let bgColor = 'bg-white';
    let textColor = 'text-gray-600';
    
    switch (syncStatus) {
      case 'loading':
        content = <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังโหลดข้อมูล...</>;
        bgColor = 'bg-blue-50 border-blue-200';
        textColor = 'text-blue-700';
        break;
      case 'saving':
        content = <><CloudUpload className="w-4 h-4 mr-2 animate-bounce" /> กำลังซิงค์ข้อมูล...</>;
        bgColor = 'bg-yellow-50 border-yellow-200';
        textColor = 'text-yellow-700';
        break;
      case 'saved':
        content = <><CheckCircle2 className="w-4 h-4 mr-2" /> ซิงค์ข้อมูลล่าสุดแล้ว</>;
        bgColor = 'bg-green-50 border-green-200';
        textColor = 'text-green-700';
        break;
      case 'error':
        content = <><AlertCircle className="w-4 h-4 mr-2" /> เชื่อมต่อล้มเหลว</>;
        bgColor = 'bg-red-50 border-red-200';
        textColor = 'text-red-700';
        break;
      default:
        return null;
    }

    return (
      <AnimatePresence mode="wait">
        {syncStatus !== 'idle' && (
          <motion.div
            key={syncStatus}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 flex items-center px-4 py-2 rounded-full shadow-md border ${bgColor} ${textColor} text-sm font-medium z-[100]`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const logActivity = (action: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    localStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentDatasetId(null);
    setShowSettings(false);
    localStorage.setItem('currentUser', JSON.stringify(user));
    logActivity('เข้าสู่ระบบ');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logActivity('ออกจากระบบ');
    setCurrentUser(null);
    setCurrentDatasetId(null);
    localStorage.removeItem('currentUser');
    setShowLogoutConfirm(false);
  };

  const handleAddDataset = (newDataset: Omit<Dataset, 'id' | 'data' | 'deletedAt' | 'userId'>) => {
    const dataset: Dataset = {
      ...newDataset,
      id: Date.now().toString(),
      userId: currentUser?.id,
      data: {
        ...initialData,
        generalInfo: {
          ...initialData.generalInfo,
          academicYear: newDataset.academicYear,
          semester: newDataset.semester,
          subjectName: newDataset.subjectName,
          learningArea: newDataset.learningArea,
          gradeLevel: newDataset.gradeLevel,
        }
      }
    };
    setDatasets(prev => [dataset, ...prev]);
    logActivity(`สร้างชุดข้อมูลใหม่: ${newDataset.subjectName} ${newDataset.gradeLevel}`);
  };

  const handleEditDataset = (id: string, updates: Partial<Dataset>) => {
    setDatasets(prev => prev.map(d => {
      if (d.id === id) {
        const updatedDataset = { ...d, ...updates };
        
        // Sync top-level properties to generalInfo
        let updatedGeneralInfo = { ...updatedDataset.data.generalInfo };
        let needsSync = false;
        
        if (updates.academicYear !== undefined) {
          updatedGeneralInfo.academicYear = updates.academicYear;
          needsSync = true;
        }
        if (updates.semester !== undefined) {
          updatedGeneralInfo.semester = updates.semester;
          needsSync = true;
        }
        if (updates.subjectName !== undefined) {
          updatedGeneralInfo.subjectName = updates.subjectName;
          needsSync = true;
        }
        if (updates.learningArea !== undefined) {
          updatedGeneralInfo.learningArea = updates.learningArea;
          needsSync = true;
        }
        if (updates.gradeLevel !== undefined) {
          updatedGeneralInfo.gradeLevel = updates.gradeLevel;
          needsSync = true;
        }

        if (needsSync) {
          updatedDataset.data = {
            ...updatedDataset.data,
            generalInfo: updatedGeneralInfo
          };
        }
        
        return updatedDataset;
      }
      return d;
    }));
    
    if (updates.status) {
      logActivity(`เปลี่ยนสถานะชุดข้อมูลเป็น: ${updates.status}`);
    } else {
      logActivity(`แก้ไขข้อมูลชุดข้อมูล`);
    }
  };

  const handleDeleteDataset = (ids: string[]) => {
    const deletedAt = new Date().toISOString();
    setDatasets(prev => prev.map(d => ids.includes(d.id) ? { ...d, deletedAt } : d));
    logActivity(`ลบชุดข้อมูลลงถังขยะ (จำนวน ${ids.length} รายการ)`);
  };

  const handleRestoreDataset = (ids: string[]) => {
    setDatasets(prev => prev.map(d => ids.includes(d.id) ? { ...d, deletedAt: null } : d));
    logActivity(`กู้คืนชุดข้อมูลจากถังขยะ (จำนวน ${ids.length} รายการ)`);
  };

  const handlePermanentDelete = (ids: string[]) => {
    setDatasets(prev => prev.filter(d => !ids.includes(d.id)));
    logActivity(`ลบชุดข้อมูลถาวร (จำนวน ${ids.length} รายการ)`);
  };

  const handleUpdateCurrentData = (newData: AppData) => {
    if (!currentDatasetId) return;
    setDatasets(prev => prev.map(d => {
      if (d.id === currentDatasetId) {
        return {
          ...d,
          data: newData,
          // Sync generalInfo back to top-level properties
          academicYear: newData.generalInfo.academicYear || d.academicYear,
          semester: newData.generalInfo.semester || d.semester,
          subjectName: newData.generalInfo.subjectName || d.subjectName,
          learningArea: newData.generalInfo.learningArea || d.learningArea,
          gradeLevel: newData.generalInfo.gradeLevel || d.gradeLevel,
        };
      }
      return d;
    }));
  };

  const handleApproveUser = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'approved' as const } : u);
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    
    const updatedNotifications = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    
    logActivity(`อนุมัติผู้ใช้งาน: ${users.find(u => u.id === userId)?.name}`);
  };

  const handleRejectUser = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'rejected' as const } : u);
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    
    const updatedNotifications = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));

    logActivity(`ปฏิเสธผู้ใช้งาน: ${users.find(u => u.id === userId)?.name}`);
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    logActivity(`แก้ไขข้อมูลผู้ใช้งาน: ${users.find(u => u.id === userId)?.name}`);
  };

  const handleRegister = async (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    
    const newNotification = {
      id: Date.now().toString(),
      type: 'user_registration',
      userId: newUser.id,
      userName: newUser.name,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));

    // Force immediate save to server
    if (webAppUrl && isDataLoaded) {
      setSyncStatus('saving');
      try {
        // 1. Fetch latest from server
        const fetchResponse = await fetch(webAppUrl);
        const fetchText = await fetchResponse.text();
        const serverData = JSON.parse(fetchText).data;

        const serverDatasets = Array.isArray(serverData.datasets) ? serverData.datasets : [];
        const serverUsers = Array.isArray(serverData.users) ? serverData.users : [];
        const serverLogs = Array.isArray(serverData.activityLogs) ? serverData.activityLogs : [];
        const serverNotifs = Array.isArray(serverData.notifications) ? serverData.notifications : [];

        // 2. Smart Merge
        const mergedDatasets = mergeEntities(latestDatasets.current, lastSavedDatasets.current, serverDatasets);
        const mergedUsers = mergeEntities(updatedUsers, lastSavedUsers.current, serverUsers);
        const mergedLogs = mergeEntities(latestActivityLogs.current, lastSavedActivityLogs.current, serverLogs);
        const mergedNotifs = mergeEntities(updatedNotifications, lastSavedNotifications.current, serverNotifs);

        // 3. Save to server
        const response = await fetch(webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({ 
            datasets: mergedDatasets,
            users: mergedUsers,
            activityLogs: mergedLogs,
            notifications: mergedNotifs
          }),
        });

        const text = await response.text();
        const result = JSON.parse(text);
        if (result.status === 'success') {
          lastSavedDatasets.current = mergedDatasets;
          lastSavedUsers.current = mergedUsers;
          lastSavedActivityLogs.current = mergedLogs;
          lastSavedNotifications.current = mergedNotifs;
          
          setDatasets(mergedDatasets);
          setUsers(mergedUsers);
          setActivityLogs(mergedLogs);
          setNotifications(mergedNotifs);
          
          setSyncStatus('saved');
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Immediate save failed:', error);
        setSyncStatus('error');
      }
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} onRegister={handleRegister} isLoading={!isDataLoaded || syncStatus === 'loading'} />;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Filter datasets for regular users
  // User says: "ให้แสดงผลชุดข้อมูลว่างเปล่า เป็นค่าเริ่มต้น" for other users.
  // We'll assume they only see their own data if we had an owner field, 
  // but since we don't, we'll just show empty for non-admins as requested.
  const visibleDatasets = currentUser.role === 'admin' ? datasets : datasets.filter(d => d.userId === currentUser.id);

  const handleAddUserByAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === newUserForm.username)) {
      alert('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
      return;
    }
    const newUser: User = {
      id: Date.now().toString(),
      name: newUserForm.name,
      username: newUserForm.username,
      password: newUserForm.password,
      status: 'approved',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    logActivity(`เพิ่มผู้ใช้งานใหม่: ${newUser.name}`);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', username: '', password: '' });
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    if (users.some(u => u.username === editingUser.username && u.id !== editingUser.id)) {
      alert('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
      return;
    }
    
    const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    logActivity(`แก้ไขข้อมูลผู้ใช้งาน: ${editingUser.name}`);
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" ใช่หรือไม่?`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
      logActivity(`ลบผู้ใช้งาน: ${user.name}`);
    }
  };

  if (!currentDatasetId) {
    return (
      <>
        {renderSyncStatus()}
        <Dashboard 
          datasets={visibleDatasets}
          onAddDataset={handleAddDataset}
          onEditDataset={handleEditDataset}
          onDeleteDataset={handleDeleteDataset}
          onRestoreDataset={handleRestoreDataset}
          onPermanentDelete={handlePermanentDelete}
          onSelectDataset={setCurrentDatasetId}
          onLogout={handleLogout}
          onSettings={() => setShowSettings(true)}
          onRefresh={() => loadData(webAppUrl)}
          currentUser={currentUser}
          unreadNotifications={unreadNotifications}
        />
        {showSettings && (
          <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in fade-in duration-200">
            <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold flex items-center text-blue-950">
                <Settings className="w-6 h-6 mr-3 text-blue-600" /> ระบบหลังบ้าน (Super Admin)
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-72 bg-white border-r border-gray-200 p-6 space-y-2 overflow-y-auto">
                <button 
                  onClick={() => setActiveAdminTab('database')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeAdminTab === 'database' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Cloud className="w-5 h-5 mr-3" /> ตั้งค่าฐานข้อมูล
                </button>
                <button 
                  onClick={() => setActiveAdminTab('approvals')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all relative ${activeAdminTab === 'approvals' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CheckCircle2 className="w-5 h-5 mr-3" /> คำขออนุมัติ
                  {unreadNotifications > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveAdminTab('users')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeAdminTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <UserIcon className="w-5 h-5 mr-3" /> จัดการผู้ใช้งาน
                </button>
                <button 
                  onClick={() => setActiveAdminTab('logs')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeAdminTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Clock className="w-5 h-5 mr-3" /> บันทึกกิจกรรม
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                  {activeAdminTab === 'database' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-6">ตั้งค่าฐานข้อมูล (Google Sheet)</h4>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <p className="text-sm text-blue-800 leading-relaxed">
                          เชื่อมต่อระบบกับ Google Sheet เพื่อสำรองข้อมูลและใช้งานแบบออนไลน์
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Google Sheet Web App URL</label>
                        <input 
                          type="text" 
                          value={tempUrl}
                          onChange={(e) => setTempUrl(e.target.value)}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <button onClick={handleSaveUrl} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">บันทึกการเชื่อมต่อ</button>
                      </div>
                    </div>
                  )}

                  {activeAdminTab === 'approvals' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-6">รายการรออนุมัติ ({users.filter(u => u.status === 'pending').length})</h4>
                      {users.filter(u => u.status === 'pending').length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">ไม่มีรายการรออนุมัติ</div>
                      ) : (
                        <div className="space-y-4">
                          {users.filter(u => u.status === 'pending').map(user => (
                            <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                              <div>
                                <div className="font-bold text-gray-900 text-lg">{user.name}</div>
                                <div className="text-sm text-gray-500 mt-1">Username: {user.username} | สมัครเมื่อ: {new Date(user.createdAt).toLocaleString('th-TH')}</div>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => handleRejectUser(user.id)} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">ปฏิเสธ</button>
                                <button onClick={() => handleApproveUser(user.id)} className="px-4 py-2 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">อนุมัติ</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeAdminTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-gray-900">ผู้ใช้งานทั้งหมด ({users.length})</h4>
                        <button 
                          onClick={() => setShowAddUserModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          + เพิ่มผู้ใช้งาน
                        </button>
                      </div>
                      <div className="overflow-hidden border border-gray-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4">ชื่อ - สกุล</th>
                              <th className="px-6 py-4">USERNAME</th>
                              <th className="px-6 py-4">รหัสผ่าน</th>
                              <th className="px-6 py-4">ระดับสิทธิ์</th>
                              <th className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-gray-600">{user.username}</td>
                                <td className="px-6 py-4 text-gray-600">{user.password}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                                    user.role === 'admin' ? (user.username === 'Admin' ? 'bg-black text-white' : 'bg-blue-100 text-blue-700') : 'bg-green-100 text-green-700'
                                  }`}>
                                    {user.role === 'admin' ? (user.username === 'Admin' ? 'SUPER_ADMIN' : 'ADMIN') : 'STAFF'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => {
                                        setEditingUser(user);
                                        setShowEditUserModal(true);
                                      }}
                                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="แก้ไขผู้ใช้งาน"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    {user.username !== 'Admin' && (
                                      <button 
                                        onClick={() => handleDeleteUser(user)} 
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="ลบผู้ใช้งาน"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeAdminTab === 'logs' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-6">บันทึกกิจกรรมล่าสุด</h4>
                      <div className="space-y-4">
                        {activityLogs.length === 0 ? (
                          <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">ไม่มีบันทึกกิจกรรม</div>
                        ) : (
                          activityLogs.map(log => (
                            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm">
                              <div className="bg-blue-100 p-3 rounded-xl">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-base font-bold text-gray-900">{log.userName} <span className="font-normal text-gray-600">{log.action}</span></div>
                                <div className="text-xs text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString('th-TH')}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">เพิ่มผู้ใช้งานใหม่</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddUserByAdmin} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    required
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    type="text" 
                    required
                    value={newUserForm.username}
                    onChange={e => setNewUserForm({...newUserForm, username: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <input 
                    type="text" 
                    required
                    value={newUserForm.password}
                    onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">ยกเลิก</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้งาน</h3>
                <button onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.name}
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.username}
                    onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.password}
                    onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {editingUser.username !== 'Admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ระดับสิทธิ์</label>
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'user'})}
                      className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="user">STAFF</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">ยกเลิก</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Confirm Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
              <p className="text-gray-500 mb-6">
                คุณต้องการออกจากระบบใช่หรือไม่?
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex-1"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmLogout}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md flex-1"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const currentDataset = datasets.find(d => d.id === currentDatasetId);
  if (!currentDataset) return null;
  const data = currentDataset.data;

  return (
    <>
      {renderSyncStatus()}
      <div className="h-screen overflow-y-auto bg-[#f8f9fa] font-sans">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://lh3.googleusercontent.com/d/1fuahKUV55Ki9C4KRpgsn_5NeEgq4e_Tl" 
              alt="TN Smart Grade Logo" 
              className="w-12 h-12 mr-4 object-contain drop-shadow-sm"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('via.placeholder.com')) {
                  target.src = 'https://via.placeholder.com/100?text=Logo';
                }
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
                TN Smart Grade
              </h1>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 tracking-wide uppercase">
                ระบบบันทึกคะแนนวัดผลประเมินผลการเรียนรู้ดิจิทัล
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                logActivity(`กลับหน้าหลักจากชุดข้อมูล: ${currentDataset.subjectName}`);
                setCurrentDatasetId(null);
              }}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium text-sm mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold mr-2">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700 mr-4">{currentUser.name}</span>
              <button onClick={() => loadData(webAppUrl)} className="text-gray-500 hover:text-blue-600 transition-colors mr-3 relative" title="รีเฟรชข้อมูล">
                <RefreshCw className="w-4 h-4" />
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => setShowSettings(true)} className="text-gray-500 hover:text-indigo-600 transition-colors mr-3 relative" title="ตั้งค่าระบบ">
                  <Settings className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="ออกจากระบบ">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Tabs Section */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-[81px] z-30">
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <nav className="flex overflow-x-auto py-3 gap-2 hide-scrollbar items-center flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ease-out flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-950 text-white shadow-md transform -translate-y-0.5'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center ml-4">
            <button
              onClick={() => exportToExcel(data)}
              className="flex items-center px-5 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-sm font-medium text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด Excel
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
          <div className="p-4 sm:p-6 w-full overflow-x-auto">
            {activeTab === 'general' && (
              <GeneralInfoForm
                data={data.generalInfo}
                appData={data}
                onChange={(generalInfo) => handleUpdateCurrentData({ ...data, generalInfo })}
              />
            )}
            {activeTab === 'students' && (
              <StudentsForm
                data={data.students}
                generalInfo={data.generalInfo}
                attendance={data.attendance}
                onChange={(students) => handleUpdateCurrentData({ ...data, students })}
                onAttendanceChange={(attendance) => handleUpdateCurrentData({ ...data, attendance })}
              />
            )}
            {activeTab === 'scores' && (
              <ScoresForm
                students={data.students}
                data={data.scores}
                generalInfo={data.generalInfo}
                scoreConfig={data.scoreConfig}
                onChange={(scores) => handleUpdateCurrentData({ ...data, scores })}
                onConfigChange={(scoreConfig) => handleUpdateCurrentData({ ...data, scoreConfig })}
              />
            )}
            {activeTab === 'attributes1_4' && (
              <AttributesForm
                students={data.students}
                data={data.attributes}
                onChange={(attributes) => handleUpdateCurrentData({ ...data, attributes })}
              />
            )}
            {activeTab === 'attributes5_8' && (
              <Attributes5_8Form
                students={data.students}
                data={data.attributes}
                onChange={(attributes) => handleUpdateCurrentData({ ...data, attributes })}
              />
            )}
            {activeTab === 'analytical' && (
              <AnalyticalForm
                students={data.students}
                data={data.analytical}
                onChange={(analytical) => handleUpdateCurrentData({ ...data, analytical })}
              />
            )}
            {activeTab === 'indicators' && (
              <IndicatorsForm
                data={data.indicators}
                scoreConfig={data.scoreConfig}
                generalInfo={data.generalInfo}
                onChange={(indicators) => handleUpdateCurrentData({ ...data, indicators })}
              />
            )}
            {activeTab === 'instructions1' && <Instructions1Form />}
            {activeTab === 'instructions2' && <Instructions2Form />}
          </div>
        </div>
      </main>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
            <p className="text-gray-500 mb-6">
              คุณต้องการออกจากระบบใช่หรือไม่?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex-1"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmLogout}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md flex-1"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
