
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ResetPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");



    async function handleSubmit(e) {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/reset-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        code,
                        newPassword: password
                    })
                }
            );


            const data = await response.json();


            if(response.ok){

                alert("Password changed successfully");

                navigate("/login");

            }else{

                alert(data.message);

            }


        } catch(error){

            alert("Server error");

        }

    }



    return (

        <div className="reset-page">

            <div className="reset-card">

                <div className="reset-header">

                    <h1>Reset Password</h1>

                    <p>
                        Enter the verification code sent to your email
                    </p>

                </div>



                <form onSubmit={handleSubmit}>


                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e=>setEmail(e.target.value)}
                            required
                        />

                    </div>



                    <div className="input-group">

                        <label>Reset Code</label>

                        <input
                            type="text"
                            placeholder="Enter 6 digit code"
                            value={code}
                            onChange={e=>setCode(e.target.value)}
                            required
                        />

                    </div>



                    <div className="input-group">

                        <label>New Password</label>

                        <input
                            type="password"
                            placeholder="Create new password"
                            value={password}
                            onChange={e=>setPassword(e.target.value)}
                            required
                        />

                    </div>



                    <button className="reset-btn">

                        Change Password

                    </button>



                    <p className="back-login">

                        Remember your password?

                        <span onClick={()=>navigate("/login")}>

                            Login

                        </span>

                    </p>


                </form>


            </div>

        </div>

    );

}

