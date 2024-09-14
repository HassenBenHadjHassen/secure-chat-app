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

  return (
    <div className="App">
      {!inRoom ? (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <input
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
          <button onClick={joinRoom}>Join Room</button>

          <div>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setUsernameFun();
                }
              }}
            />

            <button onClick={setUsernameFun}>Set Username</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Room Code: {roomCode}</h2>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <div>{typing && <span style={{ color: "gray" }}>{typing}</span>}</div>
          <input
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
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
