"use client";
import { InputGroup } from "@/components/InputGroup";
import { Signup } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { BetterAuthError } from "better-auth";
import style from "@/app/auth.module.css";

function SignupPage() {
    const { push } = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<Signup>({
        resolver: zodResolver(Signup),
    });

    const onSubmit = async (data: Signup) => {
        try {
            await signUp(data);
            push("/dashboard");
        } catch (error) {
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
                <div className={style.header}>
                    <h1>Sign Up</h1>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup
                        label="Name"
                        type="text"
                        id="name"
                        {...register("name")}
                        errorMessage={errors.name?.message}
                    />
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
                    <InputGroup
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        {...register("confirmPassword")}
                        errorMessage={errors.confirmPassword?.message}
                    />
                    {errors.root?.message && (
                        <p role="alert" aria-live="polite">
                            {errors.root.message}
                        </p>
                    )}
                    <div className={style.buttonGroup}>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={isSubmitting}>
                            Signup
                        </button>
                        <Link href="/" className="btn">
                            Avbryt
                        </Link>
                    </div>
                    <p>
                        Already have an account?{" "}
                        <Link href="/login">login here</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
export default SignupPage;
