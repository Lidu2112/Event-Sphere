import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'


ReactDOM.createRoot(document.getElementById('root')).render(

  <GoogleOAuthProvider 
    clientId="379066206944-42bep978ld9m15hs9h40qr7rosdccc7g.apps.googleusercontent.com"
  >

    <App />

  </GoogleOAuthProvider>

)