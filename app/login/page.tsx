// app/login/page.tsx
import Image from 'next/image';
import './login.css'; 

export default function LoginPage() {
  return (
    <div className="login-container">
      
      {/* Lado Izquierdo - El Formulario */}
      <div className="login-left">
        <h1 className="login-title" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
          I.E. Lucecitas del Saber
        </h1>
        <p className="login-subtitle">
          Bienvenido al Sistema de Asistencia<br />
          Sede Secundaria - Huancayo
        </p>
        
        <form style={{ width: '100%' }}>
          <div className="form-group">
            <span className="input-icon">👤</span> 
            <input 
              type="text" 
              placeholder="Código de auxiliar o correo" 
              className="login-input" 
            />
          </div>

          <div className="form-group">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="login-input" 
            />
          </div>

          <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>

          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>
      </div>

      {/* Lado Derecho - El Diseño Azul y Curvo */}
      <div className="login-right">
        <div className="illustration-placeholder">
          {/* Contenedor circular para que tu logo resalte */}
          <div className="logo-circulo">
             <Image 
              src="/Logo_principal.png" 
              alt="Logo Lucecitas del Saber"
              width={520} // Un poco más grande para que sea resaltante
              height={520}
              priority
            />
          </div>
          <p style={{ fontWeight: 'bold', fontSize: '1.4rem', margin: '15px 0 5px 0' }}>
            SISTEMA DE ASISTENCIA
          </p>
          <p style={{ fontSize: '14px', opacity: 0.9, letterSpacing: '1px' }}>
            GESTIÓN ESCOLAR INTELIGENTE
          </p>
        </div>
      </div>

    </div>
  );
}