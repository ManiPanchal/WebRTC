import Icon, { VideoCameraOutlined, LogoutOutlined, VideoCameraFilled, CopyOutlined, LinkOutlined,UsergroupAddOutlined } from '@ant-design/icons';
import styles from './style.module.css';
import { Button, Modal, Input, Space, Tooltip, Dropdown } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewMeeting from '../newMeeting/newMeeting';
export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [joinvalue,setjoinvalue]=useState('');
    const navigate=useNavigate();
    const showModal = () => {
        setIsModalOpen(true);
    };
    const joinmeeting= ()=>{
        const url = new URL(joinvalue);
        const mt = url.searchParams.get('meetingId');
          console.log(mt);
        navigate(`/newMeeting?meetingId=${mt}`);
    }
    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showNew= () =>{
        navigate('/newMeeting');
    }
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
    const items = [
        // {
        //     key: '1',
        //     label: (
        //         <p onClick={showModal}>
        //             <LinkOutlined /> Create meeting for later
        //         </p>
                
        //     ),
        // },
        {
            key: '1',
            label: (
                <p onClick={showNew}>
                    <UsergroupAddOutlined /> Start Meeting Now
                </p>
                
            ),
        }
    ];

    return (
        <>
            <div className={styles.topdiv}>
                <VideoCameraFilled style={{ color: '#E26310', fontSize: '2rem', marginRight: '0.5rem', marginTop: '0.5rem', fontWeight: '10px' }} />
                Video App
                <Tooltip title="Logout" placement='left'>

                    <LogoutOutlined style={{ float: 'right', color: '#E26310', fontSize: '1.5rem', marginRight: '1rem', marginTop: '1rem' }} />
                </Tooltip>
            </div>
            <div className={styles.main}>
                <div className={styles.seconddiv}>
                    <p className={styles.para1}>Video calls and meetings for everyone</p>
                    <p className={styles.para2}>Collect, collaborate, and celebrate from anywhere with Video App</p>
                    <Dropdown menu={{ items }} placement="bottomLeft">
                        <Button type="primary" style={{ backgroundColor: '#E26310' }}>
                            New Meeting
                        </Button>
                    </Dropdown>
                    <Modal title="Here's your joining info" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                        okButtonProps={{ style: { display: 'none' } }}
                        cancelButtonProps={{ style: { display: 'none' } }}
                        width={400}
                        centered>
                        {/* <Input placeholder="link..." /> */}
                        <p>Send this to people you want to meet with.Be sure to save it so you can use it later</p>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Input
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Meeting Link..."
                                style={{ marginRight: 8}}
                            />
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopy}
                            >
                                Copy
                            </Button>
                        </div>
                    </Modal>
                    <Space.Compact style={{ width: '50%', marginLeft: '2%' }}>
                        <Input placeholder="Enter the Link of meeting" onChange={(e)=>{setjoinvalue(e.target.value)}}/>
                        <Button type="primary" style={{ backgroundColor: '#E26310' }} onClick={joinmeeting}>Join</Button>
                    </Space.Compact>
                </div>
                <div className={styles.thirddiv}>
                    <img src="../../images/video-conferencing-software.avif" />
                    <p className={styles.para3}>Get a link you can share to people you want to meet</p>
                    {/* <p className={styles.para4}>Click New Meeting to get a link you can send to people you want to meet with</p> */}
                </div>
            </div>
        </>
    )
}
