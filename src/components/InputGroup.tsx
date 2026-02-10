import { forwardRef, InputHTMLAttributes } from "react";
import style from "./InputGroup.module.css";

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    errorMessage?: string;
}

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
    ({ label, id, errorMessage, className, ...props }, ref) => {
        return (
            <div className={`${style.formGroup} ${className || ""}`}>
                <label htmlFor={id}>{label}</label>
                <input id={id} ref={ref} {...props} />
                {errorMessage && (
                    <p className={style.errorMessage}>{errorMessage}</p>
                )}
            </div>
        );
    },
);

InputGroup.displayName = "InputGroup";
