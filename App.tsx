import { useState, useEffect, useCallback, useRef } from 'react';
import LicenseScreen from './LicenseScreen';
import WelcomeScreen from './WelcomeScreen';
import { getRemainingTime } from './license';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  category: string;
}

interface Note {
  id: string;
  content: string;
  color: string;
  createdAt: string;
}

const CATEGORIES = ['Работа', 'Личное', 'Учёба', 'Здоровье', 'Дом', 'Другое'];
const NOTE_COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7aa'];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Ошибка загрузки из localStorage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Ошибка сохранения в localStorage:', e);
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'stats'>('tasks');
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('max_tasks', []));
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('max_notes', []));
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Работа');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState(NOTE_COLORS[0]);

  const [licenseExpiry, setLicenseExpiry] = useState<Date | null>(() => {
    const stored = localStorage.getItem('max_license_expiry');
    if (stored) {
      const date = new Date(stored);
      if (date > new Date()) {
        return date;
      }
    }
    return null;
  });
  const [remainingTime, setRemainingTime] = useState<string>('');

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showLicense, setShowLicense] = useState(false);

  const exportData = useCallback(() => {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        notes,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `max-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage('✅ Резервная копия сохранена!');
    } catch (e) {
      setBackupMessage('❌ Ошибка при сохранении файла');
      console.error(e);
    }
  }, [tasks, notes]);

  const importData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
        if (data.notes && Array.isArray(data.notes)) {
          setNotes(data.notes);
        }
        setBackupMessage(`✅ Данные восстановлены! Задач: ${data.tasks?.length ?? 0}, Заметок: ${data.notes?.length ?? 0}`);
      } catch (err) {
        setBackupMessage('❌ Ошибка: файл повреждён или имеет неверный формат');
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const activateLicense = useCallback((expiryDate: Date) => {
    setLicenseExpiry(expiryDate);
    localStorage.setItem('max_license_expiry', expiryDate.toISOString());
  }, []);

  useEffect(() => {
    if (!licenseExpiry) return;
    const updateTime = () => {
      setRemainingTime(getRemainingTime(licenseExpiry));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [licenseExpiry]);

  useEffect(() => {
    if (licenseExpiry && licenseExpiry <= new Date()) {
      setLicenseExpiry(null);
      localStorage.removeItem('max_license_expiry');
    }
  }, [licenseExpiry]);

  useEffect(() => {
    saveToStorage('max_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('max_notes', notes);
  }, [notes]);

  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      category: newTaskCategory,
    };
    setTasks(prev => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskCategory('Работа');
    setShowAddTask(false);
  }, [newTaskTitle, newTaskDesc, newTaskPriority, newTaskCategory]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNote = useCallback(() => {
    if (!newNoteContent.trim()) return;
    const note: Note = {
      id: generateId(),
      content: newNoteContent.trim(),
      color: newNoteColor,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNoteContent('');
    setNewNoteColor(NOTE_COLORS[0]);
    setShowAddNote(false);
  }, [newNoteContent, newNoteColor]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброй ночи';
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  if (!licenseExpiry) {
    if (showLicense) {
      return <LicenseScreen onActivate={activateLicense} />;
    }
    return <WelcomeScreen onGoToActivation={() => setShowLicense(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-sm shadow-lg shadow-purple-500/30">
              MP
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                MAX
              </h1>
              <p className="text-xs text-slate-400">{getGreeting()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-slate-300">Всё работает ✓</span>
            </div>
            {remainingTime && (
              <div className="hidden sm:flex items-center gap-2 bg-purple-500/10 rounded-full px-4 py-2 border border-purple-500/20">
                <span className="text-xs text-purple-300">🔑 {remainingTime}</span>
              </div>
            )}
            <button
              onClick={() => setShowBackupModal(true)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              title="Резервная копия"
            >
              
            </button>
          </div>
        </div>
      </header>

      <nav className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5 border border-white/10 backdrop-blur-sm">
          {[
            { id: 'tasks' as const, label: 'Задачи', icon: '📋' },
            { id: 'notes' as const, label: 'Заметки', icon: '📝' },
            { id: 'stats' as const, label: 'Статистика', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-purple-300">{totalCount}</p>
                <p className="text-xs text-slate-400 mt-1">Всего задач</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-green-300">{completedCount}</p>
                <p className="text-xs text-slate-400 mt-1">Выполнено</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-yellow-300">{totalCount - completedCount}</p>
                <p className="text-xs text-slate-400 mt-1">В процессе</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-pink-300">{completionRate}%</p>
                <p className="text-xs text-slate-400 mt-1">Прогресс</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Общий прогресс</span>
                <span className="text-sm font-bold text-purple-300">{completionRate}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800">Все категории</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800">Все приоритеты</option>
                <option value="high" className="bg-slate-800">Высокий</option>
                <option value="medium" className="bg-slate-800">Средний</option>
                <option value="low" className="bg-slate-800">Низкий</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddTask(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Добавить задачу
            </button>

            {showAddTask && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Новая задача
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Название задачи"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      autoFocus
                    />
                    <textarea
                      placeholder="Описание (необязательно)"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-20"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Приоритет</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="low" className="bg-slate-800">Низкий</option>
                          <option value="medium" className="bg-slate-800">Средний</option>
                          <option value="high" className="bg-slate-800">Высокий</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Категория</label>
                        <select
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={addTask}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Создать
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-slate-400 text-lg">
                    {tasks.length === 0 ? 'Задач пока нет' : 'Нет задач по выбранным фильтрам'}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    {tasks.length === 0 ? 'Нажмите «Добавить задачу» чтобы начать' : 'Попробуйте изменить фильтры'}
                  </p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300 ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-500 hover:border-purple-400'
                        }`}
                      >
                        {task.completed && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-slate-400 mt-1 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                            {task.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowAddNote(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Новая заметка
            </button>

            {showAddNote && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Новая заметка
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Текст заметки..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-32"
                      autoFocus
                    />
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">Цвет</label>
                      <div className="flex gap-2">
                        {NOTE_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setNewNoteColor(color)}
                            className={`w-8 h-8 rounded-full transition-all ${
                              newNoteColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={addNote}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Создать
                    </button>
                  </div>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4"></div>
                <p className="text-slate-400 text-lg">Заметок пока нет</p>
                <p className="text-slate-500 text-sm mt-2">Нажмите «Новая заметка» чтобы начать</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="group rounded-2xl p-5 border border-white/10 hover:shadow-lg transition-all duration-300 relative"
                    style={{ backgroundColor: note.color + '20', borderColor: note.color + '40' }}
                  >
                    <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{note.content}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-6 text-purple-300">📊 Общая статистика</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-purple-300">{tasks.length}</p>
                  <p className="text-xs text-slate-400 mt-1">Всего задач</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-green-300">{completedCount}</p>
                  <p className="text-xs text-slate-400 mt-1">Выполнено</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-yellow-300">{tasks.length - completedCount}</p>
                  <p className="text-xs text-slate-400 mt-1">Активных</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-pink-300">{notes.length}</p>
                  <p className="text-xs text-slate-400 mt-1">Заметок</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-blue-300">{completionRate}%</p>
                  <p className="text-xs text-slate-400 mt-1">Прогресс</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <p className="text-3xl font-bold text-orange-300">
                    {tasks.filter(t => t.priority === 'high' && !t.completed).length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Срочных</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4 text-purple-300">📁 По категориям</h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat);
                  const catCompleted = catTasks.filter(t => t.completed).length;
                  const percentage = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-20">{cat}</span>
                      <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 w-16 text-right">
                        {catCompleted}/{catTasks.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4 text-purple-300">🎯 По приоритету</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['high', 'medium', 'low'] as const).map(priority => {
                  const count = tasks.filter(t => t.priority === priority).length;
                  const completed = tasks.filter(t => t.priority === priority && t.completed).length;
                  return (
                    <div key={priority} className="text-center p-4 bg-white/5 rounded-2xl">
                      <span className={`inline-block text-xs px-3 py-1 rounded-full border mb-2 ${priorityColors[priority]}`}>
                        {priorityLabels[priority]}
                      </span>
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-slate-400 mt-1">{completed} выполнено</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
              <p className="text-green-300 font-medium">✅ Все системы работают нормально</p>
              <p className="text-green-400/60 text-sm mt-1">Данные сохраняются локально в вашем браузере</p>
            </div>
          </div>
        )}
      </main>

      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              💾 Резервная копия
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Данные хранятся только в этом браузере. Сделайте резервную копию, чтобы не потерять их при очистке браузера или смене устройства.
            </p>

            {backupMessage && (
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-center">
                {backupMessage}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                 Скачать резервную копию
              </button>

              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  📤 Восстановить из файла
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-300/80">
                ⚠️ <strong>Важно:</strong> При восстановлении текущие данные будут заменены данными из файла. Рекомендуем сначала скачать текущую копию.
              </p>
            </div>

            <button
              onClick={() => { setShowBackupModal(false); setBackupMessage(''); }}
              className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-500 text-sm">
          MAX Планировщик • Данные хранятся локально • Никаких HTTP-запросов
        </p>
        <p className="text-slate-600 text-xs mt-2">
          💾 Не забывайте делать резервные копии!
        </p>
      </footer>
    </div>
  );
}
