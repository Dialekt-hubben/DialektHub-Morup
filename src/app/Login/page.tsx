"use client";
import { InputGroup } from "@/components/InputGroup";
import { Login } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { useRouter } from "next/navigation";
import style from './page.module.css';

function Page() {
    const { push } = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Login>({
        resolver: zodResolver(Login),
        defaultValues: {
            email: "Josef@forkman.dev",
            password: "Password1!"
        }
    })

    const onSubmit = async (data: Login) => {
        try {
            await signIn(data);
            push("/dashboard");
        } catch {
            setError("root", { message: "Invalid email or password" });
        }
    };
    

    return (
        <main className={style.main}>
            <div className={style.LoginContainer}>
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
                            <p>{errors.root.message}</p>
                        )
                    }
                    <div className={style.buttonGroup}>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>Login</button>
                        <Link href="/" className="btn">Avbryt</Link>
                    </div>
                    <p>Don&apos;t have an account? <Link href="/Signup">Sign up here</Link></p>
                </form>
            </div>
        </main>
    );
}
export default Page;