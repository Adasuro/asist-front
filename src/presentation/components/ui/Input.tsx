import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-gray-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            suppressHydrationWarning
            className={`
              w-full bg-white border rounded-xl outline-none transition-all shadow-sm
              py-3 text-sm
              ${leftIcon ? 'pl-10 pr-4' : 'px-4'}
              ${error ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] font-medium text-red-600 ml-1 flex items-center gap-1">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
