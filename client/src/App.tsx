import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import FirstModal from "./components/FirstModal";
import {
  secureChatInitialValues,
  SecureChatViewState,
} from "./SecureChatViewState";
import { SecureChatViewModel } from "./SecureChatViewModel";
import SecondModal from "./components/SecondModal";
import NotInRoom from "./components/NotInRoom";
import InRoom from "./InRoom";

const socket = io(import.meta.env.VITE_BACKEND_SERVER);

function App() {
  const [state, setState] = useState<SecureChatViewState>(
    secureChatInitialValues
  );

  const viewModel = SecureChatViewModel.getInstance();

  viewModel.initWithState(state, setState, socket);

  useEffect(() => {
    socket.on("room-created", viewModel.handleRoomCreated);
    socket.on("message", viewModel.handleMessage);
    socket.on("user-joined", viewModel.handleUserJoined);
    socket.on("user-typing", viewModel.handleUserTyping);
    socket.on("user-stopped-typing", viewModel.handleUserStoppedTyping);
    socket.on("invalid-room", viewModel.handleInvalidRoom);

    return () => {
      socket.off("room-created", viewModel.handleRoomCreated);
      socket.off("message", viewModel.handleMessage);
      socket.off("user-joined", viewModel.handleUserJoined);
      socket.off("user-typing", viewModel.handleUserTyping);
      socket.off("user-stopped-typing", viewModel.handleUserStoppedTyping);
      socket.off("invalid-room", viewModel.handleInvalidRoom);
    };
  }, []);

  return (
    <div className="App">
      {viewModel.state?.isFirstModalOpen && <FirstModal />}

      {viewModel.state?.isSecondModalOpen && <SecondModal />}

      {!viewModel.state?.inRoom ? <NotInRoom /> : <InRoom />}
    </div>
  );
}

export default App;
