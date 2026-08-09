import style from "@/app/auth.module.css";
import { SignupForm } from "@/components/Admin/SignupForm";
import { getAdminSession } from "@/lib/auth";

async function SignupPage() {
    await getAdminSession(); // Check if the user is an admin, if not redirect to login

    return (
        <main className={style.main}>
            <div className={style.authContainer}>
                <div className={style.header}>
                    <h1>Sign Up</h1>
                </div>
                <SignupForm />
            </div>
        </main>
    );
}
export default SignupPage;
