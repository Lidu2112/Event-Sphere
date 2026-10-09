import { useState } from 'react';
import { apiUrl } from '../api/config';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
 import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './AuthPage.css';

export default function LoginPage() {

    const { saveSession } = useAuth();
    const navigate = useNavigate();


    const [tab, setTab] = useState('email');

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [password, setPassword] = useState('');

    const [showPass, setShowPass] = useState(false);

    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);



    // ==========================
    // REAL LOGIN WITH BACKEND
    // ==========================

    async function handleSubmit(e) {

        e.preventDefault();

        setError('');



        if (!password) {

            setError('Password is required.');
            return;

        }



        const identifier = tab === 'email' ? email : phone;



        if (!identifier) {

            setError(
                `${tab === 'email' ? 'Email' : 'Phone'} is required.`
            );

            return;

        }



        setLoading(true);



        try {


          const body = {
    password
};

if (tab === "email") {
    body.email = email;
} else {
    body.phone = phone;
}

const response = await fetch(
    apiUrl('/api/auth/login'),
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }
);



            const data = await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message || "Login failed"
                );

            }



            console.log("Login Success:", data);



            // Save JWT + User
            saveSession(
                data.user,
                data.token
            );



            // Redirect to the home page while keeping the session active
            navigate("/");



        }

        catch(err){

            setError(
                err.message || "Login failed. Please try again."
            );

        }

        finally{

            setLoading(false);

        }


    }





    // ==========================
    // GOOGLE LOGIN (TEMP DEMO)
  





    return (

        <div className="auth-page">
            <div className="auth-right">


                <div className="auth-card">


                    <h1 className="auth-title">
                        Sign In
                    </h1>



                    <p className="auth-sub">

                        Don't have an account?

                        <Link 
                        to="/register"
                        className="auth-link">

                            Create one

                        </Link>

                    </p>




                   <GoogleLogin

onSuccess={async (credentialResponse)=>{

    try {
        const decoded = jwtDecode(credentialResponse.credential);

        const response = await fetch(
            apiUrl('/api/auth/google'),
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    googleId: decoded.sub,
                    action:"login"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Google login failed");
        }

        const user = data.user || {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: "attendee",
            provider: "google"
        };

        saveSession(user, data.token || "");
        navigate("/");
    } catch (err) {
        setError(err.message || "Google login failed");
    }

}}


/>





                    <div className="auth-divider">

                        <span>
                            or sign in with
                        </span>

                    </div>





                    <div className="auth-tabs">


                        <button
                        className={
                            tab === 'email'
                            ? 'active'
                            : ''
                        }

                        onClick={()=>{

                            setTab('email');
                            setError('');

                        }}

                        >

                            <i className="fas fa-envelope"></i>
                            Email

                        </button>





                        <button

                        className={
                            tab === 'phone'
                            ? 'active'
                            : ''
                        }


                        onClick={()=>{

                            setTab('phone');
                            setError('');

                        }}

                        >

                            <i className="fas fa-phone"></i>
                            Phone

                        </button>


                    </div>





                    {
                    error &&

                    <div className="auth-error">

                        <i className="fas fa-exclamation-circle"></i>

                        {error}

                    </div>

                    }







                    <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                    >




                    {
                    tab === 'email'

                    ?

                    <div className="form-field">

                        <label>
                            Email Address
                        </label>


                        <div className="field-wrap">


                            <i className="fas fa-envelope field-icon"></i>


                            <input

                            type="email"

                            placeholder="you@example.com"

                            value={email}

                            onChange={
                                e=>{
                                    setEmail(e.target.value);
                                    setError('');
                                }
                            }

                            />

                        </div>


                    </div>


                    :


                    <div className="form-field">

                        <label>
                            Phone Number
                        </label>


                        <div className="field-wrap">


                            <i className="fas fa-phone field-icon"></i>


                            <input

                            type="tel"

                            placeholder="+251 91 000 0000"

                            value={phone}

                            onChange={
                                e=>{
                                    setPhone(e.target.value);
                                    setError('');
                                }
                            }

                            />


                        </div>


                    </div>


                    }






                    <div className="form-field">


                        <div className="field-label-row">


                            <label>
                                Password
                            </label>



                            <p 
 className="forgot"
 onClick={()=>navigate("/forgot-password")}
>
 Forgot Password?
</p>


                        </div>





                        <div className="field-wrap">


                            <i className="fas fa-lock field-icon"></i>



                            <input

                            type={
                                showPass
                                ? "text"
                                : "password"
                            }


                            placeholder="Enter your password"


                            value={password}


                            onChange={
                                e=>{
                                    setPassword(e.target.value);
                                    setError('');
                                }
                            }

                            />




                            <button

                            type="button"

                            className="show-pass-btn"


                            onClick={()=>
                                setShowPass(!showPass)
                            }

                            >

                                <i
                                className={
                                `fas ${
                                showPass
                                ?
                                'fa-eye-slash'
                                :
                                'fa-eye'
                                }`
                                }
                                ></i>


                            </button>



                        </div>


                    </div>






                    <button

                    type="submit"

                    className="auth-submit"

                    disabled={loading}

                    >

                        {
                        loading

                        ?

                        <span className="spinner"></span>

                        :

                        "Sign In"

                        }


                    </button>





                    </form>


                </div>


            </div>



        </div>

    );


}
