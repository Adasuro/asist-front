"use client";

import React, { useState, useTransition } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, Circle } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import { loginAction } from '@/application/auth/login.action';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Password Validations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) return;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}

      <Input 
        type="email" 
        placeholder="Correo electrónico" 
        icon={<User size={20} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input 
        type={showPassword ? "text" : "password"} 
        placeholder="Contraseña" 
        icon={<Lock size={20} />}
        rightIcon={
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        }
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Password Feedback */}
      <div className="password-feedback" style={{ fontSize: '0.75rem', marginBottom: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <p style={{ color: hasMinLength ? '#4caf50' : '#888', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasMinLength ? <CheckCircle size={14} /> : <Circle size={14} />} 8+ caracteres
          </p>
          <p style={{ color: hasUppercase ? '#4caf50' : '#888', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasUppercase ? <CheckCircle size={14} /> : <Circle size={14} />} Una mayúscula
          </p>
          <p style={{ color: hasNumber ? '#4caf50' : '#888', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasNumber ? <CheckCircle size={14} /> : <Circle size={14} />} Un número
          </p>
          <p style={{ color: hasSpecialChar ? '#4caf50' : '#888', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasSpecialChar ? <CheckCircle size={14} /> : <Circle size={14} />} Carácter especial
          </p>
        </div>
      </div>

      <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>

      <Button type="submit" disabled={!isValid || isPending}>
        {isPending ? 'Ingresando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
};

export default LoginForm;
