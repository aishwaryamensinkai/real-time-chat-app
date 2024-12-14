export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Member';
}

export interface ChatRoom {
  _id: string;
  name: string;
  is_private: boolean;
  created_by: string;
  participants: string[];
}

export interface Message {
  _id: string;
  text: string;
  sender: User;
  room: string;
  timestamp: string;
}
