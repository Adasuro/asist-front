import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ icon, ...props }) => {
  return (
    <div className="form-group">
      {icon && <span className="input-icon">{icon}</span>}
      <input 
        {...props}
        className={`login-input ${icon ? 'with-icon' : ''} ${props.className || ''}`} 
      />
    </div>
  );
};

export default Input;
