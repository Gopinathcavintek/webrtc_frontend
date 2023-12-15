import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Room from "./pages/Room";
import WebRTC from "./pages/WebRTC";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/webrtc" element={<WebRTC />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
