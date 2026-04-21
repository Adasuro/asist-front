import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ icon, rightIcon, ...props }) => {
  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {icon && <span className="input-icon">{icon}</span>}
      <input 
        {...props}
        suppressHydrationWarning
        className={`login-input ${icon ? 'with-icon' : ''} ${rightIcon ? 'with-right-icon' : ''} ${props.className || ''}`} 
      />
      {rightIcon && (
        <span 
          className="input-icon-right" 
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            cursor: 'pointer',
            color: '#666',
            zIndex: 10
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  );
};

export default Input;
