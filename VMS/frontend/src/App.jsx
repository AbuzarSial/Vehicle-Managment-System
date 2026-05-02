import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
