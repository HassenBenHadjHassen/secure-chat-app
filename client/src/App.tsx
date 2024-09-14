import { useEffect, useRef, useState } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io("http://192.168.1.11:4530");

function App() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [typing, setTyping] = useState<string>("");

  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleRoomCreated = (code: string) => {
      setRoomCode(code);
      setInRoom(true);
    };

    const handleUserJoined = (userId: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${userId} joined the room`,
      ]);
    };

    const handleMessage = (encryptedMessage: string) => {
      try {
        const decryptedMessage = decryptMessage(encryptedMessage);
        setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
      } catch (error) {
        console.error("Failed to decrypt message:", error);
      }
    };

    const handleInvalidRoom = () => {
      alert("Invalid room code.");
    };

    const handleUserTyping = (username: string) => {
      setTyping(`${username} is typing...`);
    };

    const handleUserStoppedTyping = () => {
      setTyping("");
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("user-joined", handleUserJoined);
    socket.on("message", handleMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("invalid-room", handleInvalidRoom);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("user-joined", handleUserJoined);
      socket.off("message", handleMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
      socket.off("invalid-room", handleInvalidRoom);
    };
  }, []);

  const createRoom = () => {
    socket.emit("create-room");
  };

  const setUsernameFun = () => {
    if (username.trim()) {
      socket.emit("set-username", username);
      setIsSecondModalOpen(false);
    } else {
      alert("Please enter a valid Username");
    }
  };

  const joinRoom = () => {
    if (roomCode.trim()) {
      socket.emit("join-room", roomCode);
      setInRoom(true);
    } else {
      alert("Please enter a valid room code");
    }
  };

  const onMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    socket.emit("typing", roomCode);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", roomCode);
    }, 1000);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const encryptedMessage = encryptMessage(message);
      socket.emit("message", roomCode, encryptedMessage);
      setMessage("");
    } else {
      alert("Please enter a message");
    }
  };

  const encryptMessage = (message: string) => {
    return message;
  };

  const decryptMessage = (encryptedMessage: string) => {
    return encryptedMessage;
  };

  const closeFirstModal = () => {
    setIsFirstModalOpen(false);
    setIsSecondModalOpen(true);
  };

  const continueAsAnonymous = () => {
    setUsername("Anonymous");
    setIsSecondModalOpen(false);
  };

  return (
    <div className="App">
      {isFirstModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Welcome to the Chat App</h2>
            <p>
              This app allows you to create or join encrypted chat rooms. Enter
              a room code or create a new room to start chatting securely!
            </p>
            <button onClick={closeFirstModal}>Get Started</button>
          </div>
        </div>
      )}

      {isSecondModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Set Your Username</h2>
            <input
              className="input"
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div>
              <button onClick={setUsernameFun} className="btn">
                Set Username
              </button>
              <button onClick={continueAsAnonymous} className="btn">
                Continue as Anonymous
              </button>
            </div>
          </div>
        </div>
      )}

      {!inRoom ? (
        <div className="room-entry">
          <h3 style={{ marginBottom: "10px" }}>Welcome {username}</h3>
          <div className="spacing">
            <span>Would you like to create a room?</span>
            <button onClick={createRoom} className="btn">
              Create Room
            </button>
          </div>
          <div className="spacing">
            <span>Or would you rather join one?</span>
            <input
              className="input"
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  joinRoom();
                }
              }}
            />
            <button onClick={joinRoom} className="btn">
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-room">
          <h2 style={{marginBottom: "5px"}}>Room Code: {roomCode}</h2>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <div>{typing && <span className="typing">{typing}</span>}</div>
          <div className="spacing">
            <input
              className="input"
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={onMessageChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} className="btn">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
