import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './style.module.css';
import { useSocket } from "../../sockets";
// import {newMeeting} from './newMeeting';
export default function First(){
    const [email,setEmail]=useState('');
    const [roomid,SetRoomid]=useState('');
    const {socket}=useSocket();
    const navigate=useNavigate();
    const newmeeting =()=>{
        socket.emit('user-joined', { roomid });
        navigate(`/newMeeting?meetingId=${roomid}`);
        // navigate('/newMeeting');
    };
    return (
        
        <>
        <div className={styles.main}>
        <label className={styles.label1}>Email</label>
        <input className={styles.input2} type="email" placeholder="Enter your Email" value={email} onChange={(e)=>setEmail(e.target.value)}required/><br/>
        <label className={styles.label2}>Room Id</label>
        <input className={styles.input1} type="number" placeholder="Enter Room Id" value={roomid} onChange={(e)=>SetRoomid(e.target.value)}required/><br/>
        <button className={styles.button1} onClick={newmeeting}>Join Meeting</button>
        </div>
        </>
    )
}