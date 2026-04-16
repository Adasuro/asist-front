import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  return (
    <button 
      {...props} 
      className={`custom-button ${variant} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
