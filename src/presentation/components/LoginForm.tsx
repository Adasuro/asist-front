"use client";

import React, { useState, useTransition } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <Input 
        type="email" 
        label="Correo Electrónico"
        placeholder="ejemplo@correo.com" 
        leftIcon={<User size={18} />}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />

      <div className="relative group">
        <Input 
          type={showPassword ? "text" : "password"} 
          label="Contraseña"
          placeholder="••••••••" 
          leftIcon={<Lock size={18} />}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Password Feedback */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-2">
        <p className={`text-[11px] flex items-center gap-1.5 font-medium transition-colors ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
          {hasMinLength ? <CheckCircle size={12} /> : <Circle size={12} />} 8+ caracteres
        </p>
        <p className={`text-[11px] flex items-center gap-1.5 font-medium transition-colors ${hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
          {hasUppercase ? <CheckCircle size={12} /> : <Circle size={12} />} Una mayúscula
        </p>
        <p className={`text-[11px] flex items-center gap-1.5 font-medium transition-colors ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
          {hasNumber ? <CheckCircle size={12} /> : <Circle size={12} />} Un número
        </p>
        <p className={`text-[11px] flex items-center gap-1.5 font-medium transition-colors ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
          {hasSpecialChar ? <CheckCircle size={12} /> : <Circle size={12} />} Carácter especial
        </p>
      </div>

      <div className="flex justify-end">
        <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button 
        type="submit" 
        disabled={!isValid} 
        isLoading={isPending}
        className="w-full h-12 text-sm"
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
