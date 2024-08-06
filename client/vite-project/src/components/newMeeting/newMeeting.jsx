import styles from './style.module.css';
import { Button, Modal, Input, message,Drawer,Space } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { CopyOutlined ,AudioOutlined,AudioMutedOutlined,VideoCameraOutlined,PhoneFilled,MessageOutlined} from '@ant-design/icons';
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import { usePeer } from "../../peers";
import { useSocket } from '../../sockets';
import {useNavigate} from 'react-router-dom';
// const socket = io.connect("http://localhost:8000");

export default function NewMeeting() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [draweropen, setdrawopen]=useState(false);
    const [inputValue, setInputValue] = useState(window.location.href);
    const [meetingId, setMeetingId] = useState('');
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream,setRemoteStream } = usePeer();
    const {socket} =useSocket();
    const [videoStream, setVideoStream] = useState(null);
    const [audio,setaudio]=useState(true);
    const [video,setvideo]=useState(true);
    const [chat,setchat]=useState('');
    const [messages,setmessages]=useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const remoteVideoRef = useRef();
    const chatContainerRef = useRef(null);
   const navigate=useNavigate();
    useEffect(() => {
        const url = new URL(window.location.href);
        const id = url.searchParams.get('meetingId');
        if (!id) {
            const newMeetingId = uuidv4();
            console.log(newMeetingId);
            setMeetingId(newMeetingId);
            // alert(meetingId);
            setInputValue(`${window.location.href}?meetingId=${newMeetingId}`);
            //window.location.href=`${window.location.href}?meetingId=${newMeetingId}`;
        } else {
            console.log(id);
            setMeetingId(id);
            setIsModalOpen(false);
        }
        
    }, []);

    useEffect(()=>{
        if(meetingId!=='')
        {
        console.log('before socket');
        // alert(meetingId);
        socket.emit('user-joined', { meetingId: meetingId });
        playVideoFromCamera();
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleAcceptedCall);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('user-left',handleUserLeft);
        socket.on('new-message',handlenewmessage);
        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleAcceptedCall);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('user-left',handleUserLeft);
            socket.off('new-message',handlenewmessage);
        };
    }
    },[meetingId,socket]);

    
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handlenewmessage=async({mesg})=>{
        console.log('new-message');
        console.log(mesg);
        setmessages((prevState) => {
            return [...prevState, mesg];
        });
    }
    const handleUserLeft=async({meetingId})=>{
        console.log("handleuserLeft function called");
        console.log(meetingId);
        setRemoteStream(null);
        console.log(remoteStream);
        //setRemoteAns(null);
        //remoteStream(null);
        //console.log(remoteStream)
    }
    const handleNewUserJoined = async ({ meetingId,socketId }) => {
        console.log('newUserJoined');
        console.log(meetingId);
        const offer = await createOffer();
        socket.emit("call-user", { offer, targetSocketId: socketId });
    };

    const handleIncomingCall = async ({ socketId, offer }) => {
        console.log('incoming call');
        await peer.setRemoteDescription(new RTCSessionDescription(offer)); 
        await playVideoFromCamera();
        const answer = await createAnswer(offer);
        socket.emit('call-accepted', { answer, targetSocketId: socketId });
    };

    const handleAcceptedCall = async ({ answer }) => {
        console.log('accepted');
        await setRemoteAns(answer);
        // const constraints = { video: true, audio: true };
        //     const stream = await navigator.mediaDevices.getUserMedia(constraints);

        //     sendStream(stream);
    };

    const handleIceCandidate = async ({ candidate }) => {
        const pc = peer;
        console.log("ice Candidate");
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(peer);
    };

    const playVideoFromCamera = async () => {
        try {
            const constraints = { video: true, audio: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            sendStream(stream);
            setVideoStream(stream);
        } catch (error) {
            console.error('Error opening video camera.', error);
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inputValue)
            .then(() => {
                message.success('Copied to clipboard!');
            })
            .catch((err) => {
                message.error('Failed to copy!');
                console.error('Failed to copy text: ', err);
            });
    };
    const offaudio = async () => {
        const newAudioState = !audio;
        setaudio(newAudioState);
        const stream = videoStream;
    
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = newAudioState;
            });
        }
    };
    
    const offvideo = async () => {
        const newVideoState = !video;
        setvideo(newVideoState);
        const stream = videoStream;
    
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = newVideoState;
            });
        }
    };
    const showDrawer =async()=>{
        if(draweropen)
        {
            setdrawopen(false);
        }
        else{
            setdrawopen(true);
        }
    }
    
   const cutcall =async ()=>{
    if (videoStream) {
        videoStream.getTracks().forEach(track => {
            track.stop(); 
        });
        setVideoStream(null); 
    }
    if (peer) {
        peer.close(); 
    }
    socket.emit('end-call', { meetingId });
    // socket.emit('disconnect');
    navigate("/");
   }
   const newMessage=(val)=>
   {
    // console.log('send-message');
    // console.log(val);
    if(val.trim()==='')
    {
        // alert('please enter something');
        function warning() {
            messageApi.open({
              type: 'warning',
              content: 'Please Enter something',
            });
          };
          warning();
        setchat('');
    }
    else{
        console.log('inside');
       socket.emit("send-message",{meetingId:meetingId,message:val});
    //    setmessages([...messages,{val}]);
       setchat('');
    }
   }
   function chatfun(){
    return(
    <div ref={chatContainerRef} >
            {messages.map((m, index) => (
                <p key={index} className={styles.chat}>{m.val||m}</p>
            ))}
        </div>
    )
   }
    return (
        <>
        {contextHolder}
            {/* <h1>Start new meeting</h1> */}
            {videoStream && <div className={styles.videodiv}>
                <video
                    id="localVideo"
                    autoPlay
                    playsInline
                    ref={video => {
                        if (video && videoStream) {
                            video.srcObject = videoStream;
                        }
                    }}
                    style={{ width:'100%',borderRadius:'5px',maxHeight:'75vh'}}
                ></video>
                {/* <video
                    id="localVideo"
                    autoPlay
                    playsInline
                    ref={video => {
                        if (video && videoStream) {
                            video.srcObject = videoStream;
                        }
                    }}
                    style={{ width: '100%' }}
                ></video> */}
               
            </div>}
            {remoteStream && <div className={styles.user}>
                {console.log(remoteStream)}
            <video
                    id="remoteVideo"
                    autoPlay
                    playsInline
                    ref={remoteVideoRef}
                    style={{ width: '45%',borderRadius:'5px',maxHeight:'50vh' }}
                ></video>
            </div>}
            <div className={styles.media}><span>{audio?<AudioOutlined onClick={offaudio} 
            style={{fontSize:'40px',backgroundColor:'lightblue',borderRadius:'50%',padding:'10px'}}/>:
            <AudioMutedOutlined onClick={offaudio} 
            style={{fontSize:'40px',backgroundColor:'lightblue',borderRadius:'50%',padding:'10px'}}/>}
            </span>
            <span style={{paddingLeft:'5px'}}>{video?
                <VideoCameraOutlined onClick={offvideo} 
                style={{fontSize:'40px',backgroundColor:'lightblue',borderRadius:'50%',padding:'10px'}}/>:
                <VideoCameraOutlined onClick={offvideo} 
                style={{fontSize:'40px',backgroundColor:'red',borderRadius:'50%',padding:'10px'}}/>}
            </span>
            <span style={{paddingLeft:'5px'}}><PhoneFilled onClick={cutcall}
            style={{fontSize:'40px',backgroundColor:'red',borderRadius:'50%',padding:'10px'}}/>
                </span>
                <span style={{paddingLeft:'5px'}}><MessageOutlined onClick={showDrawer} style={{fontSize:'40px',backgroundColor:'lightblue',borderRadius:'50%',padding:'10px'}}/></span>
                </div>
            <Modal
                title="Here's your joining info"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}
                width={400}
                centered
            >
                <p>Send this to people you want to meet with. Be sure to save it so you can use it later.</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Meeting Link..."
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>
                </div>
            </Modal>
            <Drawer title="Chat Box" onClose={showDrawer} open={draweropen} >
                <div className={styles.drawbody}>
               {
                    messages && chatfun()
                }
        <Space.Compact style={{ width: 'inherit',marginTop:'10rem',position:'fixed',bottom:'20px',right:'20px'}}>
           <Input placeholder='Enter Message' value={chat} onChange={(e)=>setchat(e.target.value)}  />
           <Button type="primary" style={{backgroundColor:'#E26310'}} onClick={()=>newMessage(chat)}>Send</Button>
        </Space.Compact>
        </div>
      </Drawer>
        </>
    );
}
