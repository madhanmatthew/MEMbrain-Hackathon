import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoalsProvider } from './store/useGoals.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoalsProvider>
      <App />
    </GoalsProvider>
  </React.StrictMode>
)