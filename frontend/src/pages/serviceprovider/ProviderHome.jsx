import React from 'react'
import {  Outlet } from 'react-router-dom'

function ProviderHome() {
  return (
    <div>
     
        <Outlet/>
    </div>
  )
}

export default ProviderHome
