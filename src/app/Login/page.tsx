"use client";
import { InputGroup } from "@/components/InputGroup";
import { Login } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { useRouter } from "next/navigation";

function Page() {
    const { push } = useRouter();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<Login>({
        resolver: zodResolver(Login)
    })

    const onSubmit = async (data: Login) => {
        try {
            const response = await signIn(data);
            push("/dashboard");
            console.log({response});
        } catch {
            setError("root", { message: "Invalid email or password" });
        }
    };
    

    return (
        <div>
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
            <p>{errors.root?.message}</p>
            <button type="submit">Login</button>
            </form>
            <p>Don&apos;t have an account? <Link href="/Signup">Sign up here</Link></p>
        </div>
    );
}
export default Page;