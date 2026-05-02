import React from 'react'
import AppLayout from './components/layout/AppLayout'
import AppRouter from './routes/AppRouter'
import './index.css'

export default function App() {
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  )
}
