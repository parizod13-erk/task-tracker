import React, { useEffect, useState } from 'react';
import API from './api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUser, setFilterUser] = useState('All');

  const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'Пользователь' };

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/users')
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.log("Ошибка загрузки данных:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await API.post('/tasks', {
        title,
        description,
        user_id: assignedUserId ? parseInt(assignedUserId) : null
      });
      setTitle('');
      setDescription('');
      setAssignedUserId('');
      loadData();
    } catch (err) {
      alert('Ошибка при создании задачи');
    }
  };

  const handleUpdateStatus = async (taskId, task, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { ...task, status: newStatus });
      loadData();
    } catch (err) {
      alert('Ошибка при изменении статуса');
    }
  };

  const handleAssignUser = async (taskId, task, userId) => {
    try {
      await API.put(`/tasks/${taskId}`, { ...task, user_id: userId ? parseInt(userId) : null });
      loadData();
    } catch (err) {
      alert('Ошибка при назначении исполнителя');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Удалить эту задачу?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      loadData();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  const filteredTasks = tasks.filter(task => {
    const matchStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchUser = filterUser === 'All' || task.user_id?.toString() === filterUser;
    return matchStatus && matchUser;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '6px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0 }}>Панель задач: {currentUser.username} 👋</h2>
        <button onClick={handleLogout} style={{ width: 'auto', padding: '8px 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Выйти</button>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>➕ Новая задача</h3>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Название" value={title} required onChange={e => setTitle(e.target.value)} style={{ flex: '1 1 200px', padding: '8px' }} />
          <input type="text" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} style={{ flex: '1 1 300px', padding: '8px' }} />
          <select value={assignedUserId} onChange={e => setAssignedUserId(e.target.value)} style={{ flex: '1 1 200px', padding: '8px' }}>
            <option value="">Назначить исполнителя...</option>
            {users && users.map(user => (<option key={user.id || user._id} value={user.id || user._id}>{user.username || user.name || 'Без имени'}</option>))}
          </select>
          <button type="submit" style={{ padding: '8px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Добавить</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '20px', background: '#fff', padding: '15px', borderRadius: '6px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <label>Статус: </label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '5px' }}>
            <option value="All">Все</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Исполнитель: </label>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: '5px' }}>
            <option value="All">Все</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {columns.map(col => (
          <div key={col} style={{ background: '#ebecf0', padding: '15px', borderRadius: '6px', minHeight: '400px' }}>
            <h3 style={{ marginTop: 0 }}>{col} ({filteredTasks.filter(t => t.status === col).length})</h3>
            {filteredTasks.filter(t => t.status === col).map(task => (
              <div key={task.id} style={{ background: '#fff', padding: '15px', borderRadius: '4px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{task.title}</h4>
                  <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>{task.description || 'Нет описания'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
                  <label>Ответственный:
                    <select value={task.user_id || ''} onChange={e => handleAssignUser(task.id, task, e.target.value)} style={{ width: '100%', marginTop: '2px', padding: '2px' }}>
                      <option value="">Не назначен</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                  </label>
                  <label>Статус:
                    <select value={task.status} onChange={e => handleUpdateStatus(task.id, task, e.target.value)} style={{ width: '100%', marginTop: '2px', padding: '2px' }}>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
