import React from 'react'
import { Routes, Route } from 'react-router-dom'
import IgnisLayout from './components/layout/IgnisLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Polls from './pages/Polls'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <IgnisLayout>
            <Home />
          </IgnisLayout>
        }
      />
      <Route
        path="/login"
        element={
          <IgnisLayout>
            <Login />
          </IgnisLayout>
        }
      />
      <Route
        path="/polls"
        element={
          <IgnisLayout>
            <Polls />
          </IgnisLayout>
        }
      />
    </Routes>
  )
}

export default App
