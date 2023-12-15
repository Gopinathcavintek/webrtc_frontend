import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

const Login = () => {
  const loginForm = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const onSubmit = () => {
    const formdata = new FormData(loginForm.current);

    localStorage.setItem("email", formdata.get("email"));
    if (formdata.get("email") == "testing@8123.com") {
      localStorage.setItem("role", "admin");
    } else {
      localStorage.setItem("role", "user");
    }
    navigate(`/room/${formdata.get("roomid")}`);
  };

  return (
    <form ref={loginForm}>
      <input type="text" name="email" />
      <input type="text" name="roomid" />
      <button type="button" onClick={onSubmit}>
        Login
      </button>
    </form>
  );
};

export default Login;
