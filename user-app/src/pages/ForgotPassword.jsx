import { useState } from "react";
import { apiUrl } from '../api/config';
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ForgotPassword() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch(
                apiUrl('/api/auth/forgot-password'),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Reset code sent to your email");
                navigate("/reset-password");
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log(error);
            alert("Backend is not connected");
        }
    }

    return (
        <div className="reset-page">
            <div className="reset-card">

                <div className="reset-header">
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive reset code</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button className="reset-btn">
                        Send Reset Code
                    </button>

                    <p className="back-login">
                        Remember password?
                        <span onClick={() => navigate("/login")}>
                            Login
                        </span>
                    </p>

                </form>

            </div>
        </div>
    );
}
