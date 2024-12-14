export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Member';
}

export interface ChatRoom {
  id: string;
  name: string;
  is_private: boolean;
  created_by: string;
  participants: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: User;
  room: string;
  timestamp: string;
}
