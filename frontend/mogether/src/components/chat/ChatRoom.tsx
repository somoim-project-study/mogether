import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatRoomDetail, sendMessage, selectChat, connectWebSocket, disconnectWebSocket } from '../../store/slices/chatSlice';
import styled from 'styled-components';
import { AppDispatch, RootState } from '../../store/store';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { fetchProfile } from '../../store/slices/userProfileSlice';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const ParticipantListContainer = styled.div`
  margin-right: 20px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  max-height: 90vh;
  overflow-y: auto;
  min-width: 200px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: none;
  }
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 5px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ParticipantImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const ParticipantName = styled.span`
  font-size: 14px;
  color: #333;
`;

const ChatContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90vh;
  max-width: 800px;
  min-height: 500px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 80vh;
    padding: 5px;
  }
`;

const ChatHeader = styled.div`
  background-color: #7848f4;
  color: #ffffff;
  padding: 15px;
  font-size: 20px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px 10px 0 0;
`;

const ExitButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageContainer = styled.div<{ isOwnMessage: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ isOwnMessage }) => (isOwnMessage ? 'flex-end' : 'flex-start')};
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3px;
  min-width: 40px;
`;

const ProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

const Nickname = styled.span`
  font-size: 10px;
  color: #666;
  margin-top: 3px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50px;
`;

const MessageBubble = styled.div<{ isOwnMessage: boolean }>`
  background-color: ${({ isOwnMessage }) => (isOwnMessage ? '#7848f4' : '#ffffff')};
  color: ${({ isOwnMessage }) => (isOwnMessage ? '#ffffff' : '#000')};
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 60%;
  word-break: break-word;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-left: ${({ isOwnMessage }) => (isOwnMessage ? '0' : '10px')};
  margin-right: ${({ isOwnMessage }) => (isOwnMessage ? '10px' : '0')};

  &::before {
    content: '';
    position: absolute;
    top: 10px;
    ${({ isOwnMessage }) =>
      isOwnMessage
        ? 'right: -8px; border: 8px solid transparent; border-left-color: #7848f4;'
        : 'left: -8px; border: 8px solid transparent; border-right-color: #ffffff;'};
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px 0;
  background-color: #f5f5f5;
`;

const ChatInput = styled.input`
  flex: 1;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 20px;
  margin-right: 10px;
  box-sizing: border-box;
  outline: none;
  font-size: 16px;
`;

const SendButton = styled.button`
  background-color: #7848f4;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div<{ show: boolean }>`
  display: ${({ show }) => (show ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  color: #7848f4;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ChatRoom: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roomDetail, messages, loading } = useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const userId = Number(localStorage.getItem('userId')) || 0;
  const [profile, setProfile] = useState<any>({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>({});

  useEffect(() => {
    if (userId > 0) {
      dispatch(fetchProfile(userId))
        .then((response) => setProfile(response.payload));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchChatRoomDetail(Number(roomId)));
      dispatch(connectWebSocket(Number(roomId))); // WebSocket 연결
    }

    return () => {
      dispatch(disconnectWebSocket()); // WebSocket 연결 해제
    };
  }, [roomId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== '' && profile.imageUrl) {
      dispatch(
        sendMessage({
          roomId: Number(roomId),
          senderId: userId,
          nickname: profile.nickname,
          message: message,
          senderImageUrl: profile.imageUrl,
        })
      );
      setMessage('');
    }
  };

  const handleExitRoom = () => {
    navigate('/ChatList');
  };

  const openModal = (participant: any) => {
    setSelectedParticipant(participant);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleUserInfoClick = () => {
    if (selectedParticipant) {   // eventInfo, 즉 카드 정보가 존재하면 이동
      navigate(`/user/${selectedParticipant.userId}`);
    }
  };

  const handleUserPostsClick = () => {
    if (selectedParticipant) {
      navigate(`/usercreatedMoim/${selectedParticipant.userId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <ParticipantListContainer>
        {roomDetail?.participants.map((participant) => (
          <ParticipantItem key={participant.userId} onClick={() => openModal(participant)}>
            <ParticipantImage
              src={participant.imageUrl}
              alt={`${participant.nickname}의 프로필 이미지`}
            />
            <ParticipantName>{participant.nickname}</ParticipantName>
          </ParticipantItem>
        ))}
      </ParticipantListContainer>

      <ChatContainer>
        <ChatHeader>
          <span>{roomDetail?.roomName || 'Chat Room'}</span>
          <ExitButton onClick={handleExitRoom}>나가기</ExitButton>
        </ChatHeader>
        <ChatMessages>
          {messages.map((msg: any) => (
            <MessageContainer key={msg.id} isOwnMessage={msg.senderId === userId}>
              <ProfileContainer>
                <ProfileImage
                  src={msg.senderImageUrl || '../../assets/default_image.png'}
                  alt={`${msg.nickname}의 프로필 이미지`}
                />
                <Nickname>{msg.nickname}</Nickname>
              </ProfileContainer>
              <MessageBubble isOwnMessage={msg.senderId === userId}>{msg.message}</MessageBubble>
            </MessageContainer>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>
        <ChatInputContainer>
          <ChatInput
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
          />
          <SendButton onClick={handleSendMessage} disabled={!message.trim()}>
            전송
          </SendButton>
        </ChatInputContainer>
      </ChatContainer>

      <ModalOverlay show={modalIsOpen}>
        <ModalContent>
          <ModalCloseButton onClick={closeModal}>&times;</ModalCloseButton>
          <ModalTitle>유저 조회</ModalTitle>
          <DropdownItem onClick={handleUserInfoClick}>
            유저 정보 조회
          </DropdownItem>
          <DropdownItem onClick={handleUserPostsClick}>
            유저 작성 글
          </DropdownItem>
        </ModalContent>
      </ModalOverlay>
    </PageContainer>
  );
};

export default ChatRoom;
