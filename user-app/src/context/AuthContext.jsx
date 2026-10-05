import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const savedUser = localStorage.getItem("es_user");
        const savedToken = localStorage.getItem("es_token");


        if (savedUser && savedToken) {

            setUser(JSON.parse(savedUser));
            setToken(savedToken);

        }


        setLoading(false);

    }, []);



    function saveSession(userData, jwt) {


        setUser(userData);
        setToken(jwt);


        localStorage.setItem(
            "es_user",
            JSON.stringify(userData)
        );


        localStorage.setItem(
            "es_token",
            jwt
        );


    }




    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("es_user");
        localStorage.removeItem("es_token");
        // Replace history so the back button cannot return to protected pages
        window.history.pushState(null, '', '/login');
        window.history.replaceState(null, '', '/login');
    }



    return (

        <AuthContext.Provider

            value={{
                user,
                token,
                loading,
                saveSession,
                logout
            }}

        >

            {children}

        </AuthContext.Provider>

    );

}



export function useAuth() {

    return useContext(AuthContext);

}