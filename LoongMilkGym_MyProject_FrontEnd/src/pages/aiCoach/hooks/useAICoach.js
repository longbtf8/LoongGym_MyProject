import { useState, useEffect, useRef } from "react";
import PusherJS from "pusher-js";
import httpRequest from "@/services/api";
import { STORAGE_KEYS } from "@/services/api";

export function useAICoach(userInfo) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("temp-new");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState(null);

  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  // Loại bỏ khối ACTION JSON thô khỏi tin nhắn hiển thị
  const stripActionBlock = (text) => {
    if (!text) return "";
    return text.replace(/---ACTION---([\s\S]*?)---END_ACTION---/g, "").trim();
  };

  // Tải danh sách cuộc hội thoại từ backend
  const fetchConversations = async (shouldResetActive = true) => {
    try {
      if (shouldResetActive) {
        setLoadingConversations(true);
      }
      const res = await httpRequest.get("/ai/conversations");
      if (res.success && res.data) {
        setConversations(res.data);
        if (shouldResetActive) {
          setActiveConversationId("temp-new");
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại:", err);
      if (shouldResetActive) {
        setActiveConversationId("temp-new");
      }
    } finally {
      if (shouldResetActive) {
        setLoadingConversations(false);
      }
    }
  };

  // Tải danh sách tin nhắn của cuộc hội thoại
  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true);
      const res = await httpRequest.get(`/ai/conversations/${convId}/messages`);
      if (res.success && res.data) {
        const formatted = res.data.map(msg => ({
          ...msg,
          content: stripActionBlock(msg.content),
          metadata: msg.metadata || {}
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Xử lý tạo cuộc hội thoại ảo mới ở phía Client
  const handleCreateNewConversation = () => {
    setActiveConversationId("temp-new");
    setMessages([]);
  };

  // Xóa cuộc hội thoại
  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?");
    if (!confirmDelete) return;

    try {
      const res = await httpRequest.delete(`/ai/conversations/${convId}`);
      if (res.success) {
        setConversations((prev) => prev.filter(c => c.id !== convId));
        if (activeConversationId === convId) {
          setActiveConversationId("temp-new");
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi xóa cuộc trò chuyện:", err);
      alert("Xóa cuộc trò chuyện thất bại. Vui lòng thử lại.");
    }
  };

  // Gửi tin nhắn mới (cho cả quick action và gõ trực tiếp)
  const handleSendMessage = async (text) => {
    if (!text.trim() || isGenerating) return;

    let currentConvId = activeConversationId;
    setIsGenerating(true);

    const tempUserMsgId = Math.random().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserMsgId,
        role: "user",
        content: text,
        createdAt: new Date(),
      }
    ]);

    try {
      if (currentConvId === "temp-new") {
        const title = text.length > 40 ? `${text.substring(0, 40)}...` : text;
        const convRes = await httpRequest.post("/ai/conversations", {
          title,
          contextType: "general"
        });
        
        if (convRes.success && convRes.data) {
          const newConv = convRes.data;
          setConversations((prev) => [newConv, ...prev]);
          setActiveConversationId(newConv.id);
          currentConvId = newConv.id;
        } else {
          throw new Error("Không thể khởi tạo cuộc hội thoại trong DB.");
        }
      }

      const res = await httpRequest.post(`/ai/conversations/${currentConvId}/messages`, {
        content: text
      });

      if (res.success && res.data) {
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== tempUserMsgId);
          return [
            ...filtered,
            res.data.userMessage,
            {
              id: res.data.assistantMessageId,
              role: "assistant",
              content: "",
              createdAt: new Date(),
            }
          ];
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn hoặc tạo cuộc hội thoại:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "⚠️ Gửi tin nhắn thất bại. Vui lòng thử lại.",
          createdAt: new Date(),
        }
      ]);
      setIsGenerating(false);
    }
  };

  // Áp dụng đề xuất
  const handleExecuteAction = async (recommendationId) => {
    if (actionProcessingId) return;
    try {
      setActionProcessingId(recommendationId);
      const res = await httpRequest.post(`/ai/recommendations/${recommendationId}/execute`);
      if (res.success) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.metadata?.recommendation?.id === recommendationId) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  recommendation: {
                    ...msg.metadata.recommendation,
                    status: "applied",
                  },
                },
              };
            }
            return msg;
          })
        );
      }
    } catch (err) {
      console.error("Lỗi khi đồng ý đề xuất:", err);
      alert(err.response?.data?.message || "Không thể thực hiện đề xuất.");
    } finally {
      setActionProcessingId(null);
    }
  };

  // Từ chối đề xuất
  const handleRejectAction = async (recommendationId) => {
    if (actionProcessingId) return;
    try {
      setActionProcessingId(recommendationId);
      const res = await httpRequest.post(`/ai/recommendations/${recommendationId}/reject`);
      if (res.success) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.metadata?.recommendation?.id === recommendationId) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  recommendation: {
                    ...msg.metadata.recommendation,
                    status: "rejected",
                  },
                },
              };
            }
            return msg;
          })
        );
      }
    } catch (err) {
      console.error("Lỗi khi từ chối đề xuất:", err);
    } finally {
      setActionProcessingId(null);
    }
  };

  // Tải danh sách khi đổi cuộc hội thoại
  useEffect(() => {
    if (activeConversationId && activeConversationId !== "temp-new") {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Kết nối Pusher
  useEffect(() => {
    if (!userInfo?.id || !activeConversationId || activeConversationId === "temp-new") return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const wsHost = import.meta.env.VITE_PUSHER_HOST || "127.0.0.1";
    const wsPort = Number(import.meta.env.VITE_PUSHER_PORT) || 6002;
    const forceTLS = import.meta.env.VITE_PUSHER_FORCE_TLS === "true" || false;

    const pusher = new PusherJS(import.meta.env.VITE_PUSHER_APP_KEY || "GYM_CHAT_APP", {
      wsHost,
      wsPort,
      forceTLS,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: "",
      channelAuthorization: {
        endpoint: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3009/api"}/ai/broadcasting/auth`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    pusherRef.current = pusher;
    const channelName = `private-ai.${userInfo.id}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("ai.chunk", (data) => {
      if (data.conversationId !== activeConversationId) return;
      
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === data.messageId);
        if (index === -1) {
          return [
            ...prev,
            {
              id: data.messageId,
              role: "assistant",
              content: stripActionBlock(data.chunk),
              createdAt: new Date(),
            },
          ];
        } else {
          const updated = [...prev];
          const rawContent = updated[index].content + data.chunk;
          updated[index] = {
            ...updated[index],
            content: stripActionBlock(rawContent),
          };
          return updated;
        }
      });
      setIsGenerating(true);
    });

    channel.bind("ai.done", (data) => {
      if (data.conversationId !== activeConversationId) return;
      
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === data.messageId);
        const cleanContent = stripActionBlock(data.content);
        if (index === -1) {
          return [
            ...prev,
            {
              id: data.messageId,
              role: "assistant",
              content: cleanContent,
              createdAt: new Date(),
              metadata: data.recommendation ? { recommendation: data.recommendation } : {},
            },
          ];
        } else {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            content: cleanContent,
            metadata: data.recommendation ? { recommendation: data.recommendation } : {},
          };
          return updated;
        }
      });
      setIsGenerating(false);
      fetchConversations(false);
    });

    channel.bind("ai.error", (data) => {
      if (data.conversationId !== activeConversationId) return;
      
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === data.messageId);
        if (index === -1) {
          return [
            ...prev,
            {
              id: data.messageId,
              role: "assistant",
              content: `⚠️ Lỗi: ${data.error}`,
              createdAt: new Date(),
            },
          ];
        } else {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            content: `⚠️ Lỗi: ${data.error}`,
          };
          return updated;
        }
      });
      setIsGenerating(false);
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe(channelName);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [userInfo?.id, activeConversationId]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isGenerating,
    loadingConversations,
    loadingMessages,
    actionProcessingId,
    fetchConversations,
    handleCreateNewConversation,
    handleDeleteConversation,
    handleSendMessage,
    handleExecuteAction,
    handleRejectAction,
  };
}
