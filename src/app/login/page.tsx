"use client";
import { InputGroup } from "@/components/InputGroup";
import { Login } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { BetterAuthError } from "better-auth";
import style from '@/app/auth.module.css';

function LoginPage() {
    const { push } = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Login>({
        resolver: zodResolver(Login),
    })

    const onSubmit = async (data: Login) => {
        try {
            await signIn(data);
            push("/dashboard");
        } catch(error) {
            // Handle BetterAuthError specifically
            if (error instanceof BetterAuthError) {                
                setError("root", { message: error.message });
                return;
            }
            
            // Handle generic Error instances
            if (error instanceof Error) {                
                setError("root", { message: error.message });
                return;
            }

            // Fallback error message
            setError("root", { message: "Invalid email or password" });
        }
    };
    

    return (
        <main className={style.main}>
            <div className={style.authContainer}>
                <div className={style.header}><h1>Login</h1></div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup
                        label="Email"
                        type="email"
                        id="email"
                        {...register("email")}
                        errorMessage={errors.email?.message}
                    />
                    <InputGroup
                        label="Password"
                        type="password"
                        id="password"
                        {...register("password")}
                        errorMessage={errors.password?.message}
                    />
                    {
                        errors.root?.message && (
                            <p role="alert" aria-live="polite">{errors.root.message}</p>
                        )
                    }
                    <div className={style.buttonGroup}>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>Login</button>
                        <Link href="/" className="btn">Avbryt</Link>
                    </div>
                    <p>Don&apos;t have an account? <Link href="/signup">Sign up here</Link></p>
                </form>
            </div>
        </main>
    );
}
export default LoginPage;