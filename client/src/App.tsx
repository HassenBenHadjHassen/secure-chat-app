import { useEffect, useRef, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const socket = io(import.meta.env.VITE_BACKEND_SERVER);

function App() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [typing, setTyping] = useState<string>("");

  const [isFirstModalOpen, setIsFirstModalOpen] = useState(true);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingTimeoutRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const addEmoji = (emoji: any) => {
    setMessage(message + emoji.native);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    const handleRoomCreated = (code: string) => {
      setRoomCode(code);
      setInRoom(true);
    };

    const handleMessage = (data: { message: string; sender: string }) => {
      try {
        const decryptedMessage = decryptMessage(data.message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: decryptedMessage, sender: data.sender },
        ]);
      } catch (error) {
        console.error("Failed to decrypt message:", error);
      }
    };

    const handleUserJoined = (userId: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${userId} joined the room`, sender: "system" },
      ]);
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
    socket.on("message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("invalid-room", handleInvalidRoom);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("message", handleMessage);
      socket.off("user-joined", handleUserJoined);
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

  const onChangeUserNameClick = () => {
    setIsSecondModalOpen(true);
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

            <p>
              All chats are client-side and are automatically deleted upon
              closing or refreshing the browser tab.
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
          <div className="username">
            <h3>Welcome, {username}</h3>
            <img
              src="https://www.svgrepo.com/download/436186/edit-tool-pencil.svg"
              alt="edit username"
              onClick={onChangeUserNameClick}
            />
          </div>
          <div className="action-group">
            <span className="prompt-text">
              Would you like to create a room?
            </span>
            <button onClick={createRoom} className="btn primary-btn">
              Create Room
            </button>
          </div>
          <div className="action-group">
            <span className="prompt-text">Or would you rather join one?</span>
            <div className="input-wrapper">
              <input
                className="input room-input"
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
              <button onClick={joinRoom} className="btn secondary-btn">
                Join Room
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-room">
          <h2 style={{ textAlign: "center" }}>Room Code: {roomCode}</h2>
          <div className="messages">
            {messages
              .slice()
              .reverse()
              .map((msg, index) => (
                <div
                  key={index}
                  className={`message-container ${
                    msg.sender === username ? "outgoing" : "incoming"
                  }`}
                >
                  <span
                    className={`sender-name ${
                      msg.sender === username
                        ? "outgoing-name"
                        : "incoming-name"
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <div
                    className={`message ${
                      msg.sender === username ? "outgoing" : "incoming"
                    }`}
                  >
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
          </div>

          <div>{typing && <span className="typing">{typing}</span>}</div>
          <div className="spacing">
            <div className="room-input">
              <input
                ref={inputRef}
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
              <button
                className="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  <Picker data={data} onEmojiSelect={addEmoji} />
                </div>
              )}
            </div>

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
