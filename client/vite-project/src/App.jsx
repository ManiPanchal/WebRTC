import { useState } from 'react'
import {Route, Routes} from 'react-router-dom'
import { PeerProvider } from './peers'
import { SocketProvider } from './sockets'
import Home from './components/home/home'
import NewMeeting from './components/newMeeting/newMeeting'
import First from './components/first/first'
function App() {
  

  return (
    <>
    <SocketProvider>
    <PeerProvider>
    <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/newMeeting" element={<NewMeeting/>}/>
    </Routes>  
    </PeerProvider>
    </SocketProvider>
    </>
  )
}

export default App
