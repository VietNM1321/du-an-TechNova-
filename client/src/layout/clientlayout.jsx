import Footer from '../components/Footer'
import Header from '../components/Header'
import Home from "../pages/Home"
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
  return (
    <>
      <Header />
      <main className="container mx-auto p-4">
        <Outlet /> 
      </main>
      <Footer />
    </>
  )
}

export default ClientLayout
