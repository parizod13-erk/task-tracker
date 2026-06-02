import React, { useState } from 'react';
import API from './api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход в систему</h2>
      {error && <p style={{ color: 'red' }}>🛑 {error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input type="text" placeholder="Имя пользователя" value={username} required onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Пароль" value={password} required onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Войти</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </div>
  );
}
