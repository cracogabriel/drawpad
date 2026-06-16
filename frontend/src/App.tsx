import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./app/Home";
import Room from "./app/Room";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomName" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}
