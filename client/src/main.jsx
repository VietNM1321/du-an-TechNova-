import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './components/CartContext.jsx'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    componentDidCatch(error, info) {
        // you can log to monitoring service here
        // console.error('Uncaught error:', error, info)
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{padding: 40, textAlign: 'center'}}>
                    <h2>Đã có lỗi xảy ra — Vui lòng thử lại.</h2>
                    <a href="/">Quay về trang chủ</a>
                </div>
            )
        }
        return this.props.children
    }
}

createRoot(document.getElementById('root')).render(
    <CartProvider>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </CartProvider>
)