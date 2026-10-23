import { Navigate, Route, Routes } from 'react-router-dom'
import { EmoticonRoutes } from './emoticon/EmoticonScreens'
import { EmoticonProvider } from './emoticon/store'
import { ServicesHome, TranslateScreen } from './translate/TranslateScreens'

export default function App() {
  return (
    <EmoticonProvider>
      <div className="stage">
      <Routes>
        <Route path="/" element={<Navigate to="/services" replace />} />
        <Route path="/services" element={<ServicesHome />} />
        <Route path="/services/translate" element={<TranslateScreen />} />
        <Route path="/emoticon/*" element={<EmoticonRoutes />} />
        <Route path="*" element={<Navigate to="/services" replace />} />
      </Routes>
      </div>
    </EmoticonProvider>
  )
}
