import { forwardRef, InputHTMLAttributes } from 'react';

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
}

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  ({ label, id, errorMessage, className, ...props }, ref) => {
    return (
      <div className={`formGrope ${className || ''}`}>
        <label htmlFor={id}>{label}</label>
        <input id={id} ref={ref} {...props} />
        <p className="error-message">{errorMessage}</p>
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";
