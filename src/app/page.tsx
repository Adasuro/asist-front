import Image from 'next/image';
import LoginForm from "@/presentation/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login-container">
      
      {/* Lado Izquierdo - El Formulario */}
      <div className="login-left">
        <h1 className="login-title">
          I.E. Lucecitas del Saber
        </h1>
        <p className="login-subtitle">
          Bienvenido al Sistema de Asistencia<br />
          Sede Secundaria - Huancayo
        </p>
        
        <LoginForm />
      </div>

      {/* Lado Derecho - El Diseño Azul y Curvo */}
      <div className="login-right">
        <div className="illustration-placeholder">
          {/* Contenedor circular para que tu logo resalte */}
          <div className="logo-circulo">
             <Image 
              src="/Logo_principal.png" 
              alt="Logo Lucecitas del Saber"
              width={520} 
              height={520}
              priority
            />
          </div>
          <p className="illustration-title">
            SISTEMA DE ASISTENCIA
          </p>
          <p className="illustration-subtitle">
            GESTIÓN ESCOLAR INTELIGENTE
          </p>
        </div>
      </div>

    </div>
  );
}
