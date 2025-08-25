// hooks/useChats.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChats,
  createChat,
  updateChat,
  deleteChat,
  createQuery,
} from "../Services/chatService";

export const useChats = (userId) => {
  const queryClient = useQueryClient();

  // Fetch all chats for a user
  const chatsQuery = useQuery({
    queryKey: ["chats", userId],
    queryFn: () => fetchChats(userId),
    enabled: !!userId,
  });

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries(["chats", userId]); // refresh chats list
    },
  });

  // Update chat
  const updateChatMutation = useMutation({
    mutationFn: updateChat,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["chats", userId]);
      queryClient.invalidateQueries(["chat", vars.chatId]); // refresh specific chat if used
    },
  });

  // Delete chat
  const deleteChatMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries(["chats", userId]);
    },
  });

  // Add query inside chat
  const createQueryMutation = useMutation({
    mutationFn: createQuery,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["chats", userId]);
      queryClient.invalidateQueries(["chat", vars.chatId]);
    },
  });

  return {
    chatsQuery,
    createChatMutation,
    updateChatMutation,
    deleteChatMutation,
    createQueryMutation,
  };
};
