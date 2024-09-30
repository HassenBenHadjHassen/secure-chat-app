import { Messages } from "./types";

export class SecureChatViewState {
  messages: Messages[];
  roomCode: string;
  message: string;
  username: string;
  typing: string;

  inRoom: boolean;
  isFirstModalOpen: boolean;
  isSecondModalOpen: boolean;
  showEmojiPicker: boolean;

  constructor(
    messages: Messages[],
    roomCode: string,
    message: string,
    username: string,
    typing: string,
    inRoom: boolean,
    isFirstModalOpen: boolean,
    isSecondModalOpen: boolean,
    showEmojiPicker: boolean
  ) {
    this.messages = messages;
    this.roomCode = roomCode;
    this.message = message;
    this.username = username;
    this.typing = typing;
    this.inRoom = inRoom;
    this.isFirstModalOpen = isFirstModalOpen;
    this.isSecondModalOpen = isSecondModalOpen;
    this.showEmojiPicker = showEmojiPicker;
  }
}

export const secureChatInitialValues: SecureChatViewState = {
  messages: [],
  roomCode: "",
  message: "",
  username: "",
  typing: "",
  inRoom: false,
  isFirstModalOpen: true,
  isSecondModalOpen: false,
  showEmojiPicker: false,
};
