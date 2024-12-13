import React from "react";

const MessageBox = ({ messages }) => {
  return (
    <div className="message-box">
      {messages.map((msg) => (
        <div key={msg._id} className="message">
          <strong>{msg.sender.username}</strong>: {msg.text}
        </div>
      ))}
    </div>
  );
};

export default MessageBox;
