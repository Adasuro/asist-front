"use client";

import React from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const LoginForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de inicio de sesión
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Input 
        type="text" 
        placeholder="Código de auxiliar o correo" 
        icon="👤"
        required
      />

      <Input 
        type="password" 
        placeholder="Contraseña" 
        icon="🔒"
        required
      />

      <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>

      <Button type="submit">
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
