import Footer from '../components/Footer'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-[20px] pb-[80px]">
        <Outlet />
      </main>

      <Footer className="h-[80px] fixed bottom-0 left-0 right-0 w-full bg-white shadow-md" />
    </div>
  )
}

export default ClientLayout