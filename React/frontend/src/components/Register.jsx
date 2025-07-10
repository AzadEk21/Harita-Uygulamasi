import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showPopup } from '../openlayers/popup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (username.length < 6) {
      showPopup('Kullanıcı adı en az 6 karakter olmalı.', 'error');
      return false;
    }
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      showPopup('Şifre en az 8 karakter ve bir büyük harf içermelidir.', 'error');
      return false;
    }
    if (!email.includes('@')) {
      showPopup('Geçerli bir e-posta adresi giriniz.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      await axios.post('https://localhost:7261/api/auth/register', {
        username,
        password,
        email,
      });
      showPopup('Kayıt başarılı! Doğrulama maili gönderildi.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      showPopup('Kayıt başarısız. Bu kullanıcı veya e-posta zaten mevcut.', 'error');
    }
  };

  return (
    <div className="register-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit}>
        {/* Kullanıcı Adı */}
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <small className="input-hint">Kullanıcı adı en az 6 karakter olmalı</small>

        {/* Şifre */}
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-icon"
          />
        </div>
        <small className="input-hint">Şifre en az 8 karakter ve bir büyük harf içermelidir</small>

        {/* E-posta */}
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Kayıt Ol</button>
        <button type="button" onClick={() => navigate('/login')}>Girişe Dön</button>
      </form>
    </div>
  );
};

export default Register;
