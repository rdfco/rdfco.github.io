import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles.css'
const root=document.getElementById('root');if(!root)throw new Error('Missing #root application mount')
hydrateRoot(root, <App />)
