import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/index'
import './styles.css'
const root=document.getElementById('root');if(!root)throw new Error('Missing #root application mount')
ReactDOM.createRoot(root).render(<React.StrictMode><App /></React.StrictMode>)
