import React from 'react'
import { Link, Outlet } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
      <h2>Hello service provider complete your profile</h2>
      <Link to="profile">Profile</Link>
        <Outlet/>
      
    </div>
  )
}

export default Dashboard;
