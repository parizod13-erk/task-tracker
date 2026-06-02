import React, { useState } from 'react';
import API from './api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/register', { username, email, password });
      if (response.status === 201) {
        alert("Успешно! Аккаунт создан. Теперь переходим к входу.");
        window.location.href = '/login';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось связаться с бэкендом.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация в Task Tracker</h2>
      {error && <p style={{ color: 'red' }}>🛑 {error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input type="text" placeholder="Имя пользователя" value={username} required onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email" value={email} required onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Пароль" value={password} required onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Создать аккаунт</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
}


