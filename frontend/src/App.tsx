import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/DashboardPage'
import Trucks from './pages/Trucks'
import Trips from './pages/Trips'
import Drivers from './pages/Drivers'
import Invoices from './pages/Invoices'
import IFTACalculator from './pages/IFTACalculator'
import IFTAFormGenerator from './pages/IFTAFormGenerator'
import Maintenance from './pages/Maintenance'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/ifta" element={<IFTACalculator />} />
          <Route path="/ifta-form" element={<IFTAFormGenerator />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
