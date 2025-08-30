// Services/chatService.js
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/chats`;

// Get all chats of a user
export const fetchChats = async (userId) => {
  const res = await axios.get(`${API}/user/${userId}`);
  return res.data.data.docs; // array of chats
};

// Create new chat
export const createChat = async ({ userId }) => {
  const res = await axios.post(`${API}/user/${userId}/create`);
  return res.data.data;
};

// Update chat
export const updateChat = async ({ chatId, name }) => {
  const res = await axios.patch(`${API}/update/${chatId}`, { name });
  return res.data.data.doc;
};

// Delete chat
export const deleteChat = async (chatId) => {
  const res = await axios.delete(`${API}/delete/${chatId}`);
  return res.data;
};

export const fetchQueries = async ({chatId}) => {
  const res = await axios.get(`${API}/${chatId}`);
  return res.data.data.messages;
}

// Create query inside a chat
export const createQuery = async ({ chatId, query, response }) => {
  const res = await axios.patch(`${API}/${chatId}/create`, { query, response });
  return res.data.data.message;
};
