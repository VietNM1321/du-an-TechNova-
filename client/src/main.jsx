import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './components/cart.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <CartProvider>
    <App />
    </CartProvider>
)