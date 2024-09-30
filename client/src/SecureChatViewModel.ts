import { Socket } from "socket.io-client";
import { SecureChatViewState } from "./SecureChatViewState";

export class SecureChatViewModel {
  private static instance: SecureChatViewModel;

  static getInstance = (): SecureChatViewModel => {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new SecureChatViewModel();
    return this.instance;
  };

  state: SecureChatViewState | null = null;
  setState: React.Dispatch<React.SetStateAction<SecureChatViewState>> | null =
    null;
  socket: Socket<any, any> | null = null;

  initWithState(
    state: SecureChatViewState,
    setState: React.Dispatch<React.SetStateAction<SecureChatViewState>>,
    socket: Socket<any, any>
  ) {
    this.setState = setState;
    this.state = state;
    this.socket = socket;
  }

  private encryptMessage = (message: string) => {
    return message;
  };

  private decryptMessage = (encryptedMessage: string) => {
    return encryptedMessage;
  };

  addEmoji = (emoji: any, inputRef: React.RefObject<HTMLInputElement>) => {
    this.setState?.((prevState) => ({
      ...prevState,
      message: this.state?.message + emoji.native,
    }));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  handleRoomCreated = (code: string) => {
    this.setState?.((prevState) => ({
      ...prevState,
      roomCode: code,
      inRoom: true,
    }));
  };

  handleMessage = (data: { message: string; sender: string }) => {
    try {
      const decryptedMessage = this.decryptMessage(data.message);
      this.setState?.((prevState) => ({
        ...prevState,
        messages: [
          ...prevState.messages,
          { text: decryptedMessage, sender: data.sender },
        ],
      }));
    } catch (error) {
      console.error("Failed to decrypt message:", error);
    }
  };

  handleUserJoined = (userId: string) => {
    this.setState?.((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages,
        { text: `${userId} joined the room`, sender: "system" },
      ],
    }));
  };

  handleUserTyping = (username: string) => {
    this.setState?.((prevState) => ({
      ...prevState,
      typing: `${username} is typing...`,
    }));
  };

  handleUserStoppedTyping = () => {
    this.setState?.((prevState) => ({
      ...prevState,
      typing: "",
    }));
  };

  handleInvalidRoom = () => {
    alert("Invalid room code.");
  };

  createRoom = () => {
    this.socket?.emit("create-room");
  };

  setUsernameFun = () => {
    if (this.state?.username.trim()) {
      this.socket?.emit("set-username", this.state?.username);
      this.setState?.((prevState) => ({
        ...prevState,
        isSecondModalOpen: false,
      }));
    } else {
      alert("Please enter a valid Username");
    }
  };

  joinRoom = () => {
    if (this.state?.roomCode.trim()) {
      this.socket?.emit("join-room", this.state?.roomCode);
      this.setState?.((prevState) => ({
        ...prevState,
        inRoom: true,
      }));
    } else {
      alert("Please enter a valid room code");
    }
  };

  onMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    typingTimeoutRef: React.MutableRefObject<any>
  ) => {
    this.setState?.((prevState) => ({
      ...prevState,
      message: e.target.value,
    }));

    this.socket?.emit("typing", this.state?.roomCode);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      this.socket?.emit("stop-typing", this.state?.roomCode);
    }, 1000);
  };

  sendMessage = () => {
    if (this.state?.message.trim()) {
      const encryptedMessage = this.encryptMessage(this.state?.message);

      this.socket?.emit("message", this.state?.roomCode, encryptedMessage);

      this.setState?.((prevState) => ({
        ...prevState,
        message: "",
      }));
    } else {
      alert("Please enter a message");
    }
  };

  closeFirstModal = () => {
    this.setState?.((prevState) => ({
      ...prevState,
      isFirstModalOpen: false,
      isSecondModalOpen: true,
    }));
  };

  continueAsAnonymous = () => {
    this.setState?.((prevState) => ({
      ...prevState,
      username: "Anonymous",
      isSecondModalOpen: false,
    }));
  };

  onChangeUserNameClick = () => {
    this.setState?.((prevState) => ({
      ...prevState,
      isSecondModalOpen: true,
    }));
  };

  onUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState?.((prevState) => ({
      ...prevState,
      username: e.target.value,
    }));
  };

  onRoomCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState?.((prevState) => ({
      ...prevState,
      roomCode: e.target.value,
    }));
  };

  onShowEmojiPickerButtonClick = () => {
    this.setState?.((prevState) => ({
      ...prevState,
      showEmojiPicker: !this.state?.showEmojiPicker,
    }));
  };
}
