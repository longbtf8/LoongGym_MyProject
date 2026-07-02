import { useState, useEffect, useRef, useCallback } from "react";
import PusherJS from "pusher-js";
import httpRequest from "@/services/api";
import { STORAGE_KEYS } from "@/services/api";

export function useAICoach(userInfo) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("temp-new");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStatus, setPlanningStatus] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const isNewConversationRef = useRef(false);
  const sendingRef = useRef(false);
  const toastTimerRef = useRef(null);
  const activeConversationIdRef = useRef(activeConversationId);
  const streamingContentRef = useRef("");
  const safetyTimeoutRef = useRef(null);

  const resetSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    safetyTimeoutRef.current = setTimeout(() => {
      setIsGenerating(false);
      setIsPlanning(false);
      setPlanningStatus(null);
    }, 60000);
  }, []);

  const getPlanningStatus = useCallback((typeOrText = "") => {
    const normalized = typeOrText
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalized.includes("generate_training_plan") || normalized.includes("tao mau lich") || normalized.includes("tao lich")) {
      return {
        title: "AI Coach đang tạo lịch tập...",
        detail: "Đang dựng mẫu tuần, chọn bài tập và chuẩn bị đề xuất để bạn bấm Đồng ý.",
      };
    }

    if (normalized.includes("update_training_plan") || normalized.includes("reschedule") || normalized.includes("sap xep")) {
      return {
        title: "AI Coach đang sắp xếp lại lịch...",
        detail: "Đang kiểm tra các buổi hiện tại và tạo phương án đổi lịch phù hợp.",
      };
    }

    if (normalized.includes("swap_exercise") || normalized.includes("thay the") || normalized.includes("dau vai") || normalized.includes("chan thuong")) {
      return {
        title: "AI Coach đang tìm bài thay thế...",
        detail: "Đang rà soát vùng đau, nhóm cơ liên quan và chọn bài tập an toàn hơn.",
      };
    }

    if (normalized.includes("adjust_volume")) {
      return {
        title: "AI Coach đang chỉnh khối lượng tập...",
        detail: "Đang cân lại sets, reps và mức tạ theo tình trạng hiện tại của bạn.",
      };
    }

    if (normalized.includes("deload") || normalized.includes("met moi") || normalized.includes("kiet suc")) {
      return {
        title: "AI Coach đang tạo phương án hồi phục...",
        detail: "Đang đánh giá mức mệt và đề xuất nghỉ, giảm tải hoặc đổi buổi tập.",
      };
    }

    if (normalized.includes("skip_day")) {
      return {
        title: "AI Coach đang chuẩn bị ngày nghỉ...",
        detail: "Đang ghi nhận lý do và cập nhật lịch để ưu tiên phục hồi.",
      };
    }

    if (normalized.includes("nutrition_adjust") || normalized.includes("calories") || normalized.includes("dinh duong") || normalized.includes("giam mo") || normalized.includes("tang co")) {
      return {
        title: "AI Coach đang tính dinh dưỡng...",
        detail: "Đang ước tính calories, macro và gợi ý điều chỉnh theo mục tiêu.",
      };
    }

    return {
      title: "AI Coach đang suy nghĩ...",
      detail: "Đang phân tích dữ liệu và lên phương án phù hợp.",
    };
  }, []);

  const getActionTypeFromText = useCallback((text = "") => {
    return text.match(/["']?type["']?\s*:\s*["']([^"']+)["']/i)?.[1] || "";
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3200);
  }, []);

  const stripActionBlock = useCallback((text) => {
    if (!text) return "";
    let clean = text;

    // 1. Loại bỏ ---ACTION--- đến cuối hoặc đến ---END_ACTION---
    clean = clean.replace(/---ACTION---[\s\S]*?(---END_ACTION---|$)/g, "");

    // 2. Loại bỏ ```action đến cuối hoặc đến ```
    clean = clean.replace(/```action[\s\S]*?(```|$)/g, "");

    // 3. Loại bỏ ```json chứa các từ khóa hành động đến cuối hoặc đến ```
    clean = clean.replace(/```json[\s\S]*?(```|$)/g, (match) => {
      if (/type|payload|days|exerciseId/i.test(match)) {
        return "";
      }
      return match;
    });

    // 4. Loại bỏ các khối JSON thô dạng { ... } đang stream chứa từ khóa hành động
    const rawJsonStart = clean.search(/\{[\s\S]*?(type|payload|days|exerciseId)/i);
    if (rawJsonStart !== -1) {
      const suffix = clean.slice(rawJsonStart);
      if (/type|payload|days|exerciseId/i.test(suffix)) {
        clean = clean.slice(0, rawJsonStart).trim();
      }
    }

    // 5. Làm sạch code block bị cắt cụt cuối chuỗi
    clean = clean.replace(/```\s*$/g, "");

    return clean.trim();
  }, []);

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
  const fetchMessages = useCallback(async (convId) => {
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
  }, [stripActionBlock]);

  // Xử lý tạo cuộc hội thoại ảo mới ở phía Client
  const handleCreateNewConversation = () => {
    setActiveConversationId("temp-new");
    setMessages([]);
  };

  // Xóa cuộc hội thoại
  const handleDeleteConversation = async (convId) => {
    try {
      const res = await httpRequest.delete(`/ai/conversations/${convId}`);
      if (res.success) {
        setConversations((prev) => prev.filter(c => c.id !== convId));
        if (activeConversationId === convId) {
          setActiveConversationId("temp-new");
          setMessages([]);
        }
        showToast("Đã xoá cuộc trò chuyện.", "info");
      }
    } catch (err) {
      console.error("Lỗi khi xóa cuộc trò chuyện:", err);
      showToast("Thao tác thất bại, vui lòng báo cáo admin.", "error");
    }
  };

  // Gửi tin nhắn mới (cho cả quick action và gõ trực tiếp)
  const handleSendMessage = async (text) => {
    if (!text.trim() || isGenerating || sendingRef.current) return;
    sendingRef.current = true;
    streamingContentRef.current = "";

    let currentConvId = activeConversationId;
    setIsGenerating(true);
    setIsPlanning(false);
    setPlanningStatus(getPlanningStatus(text));
    resetSafetyTimeout();

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
        isNewConversationRef.current = true;
        const title = text.length > 40 ? `${text.substring(0, 40)}...` : text;
        const convRes = await httpRequest.post("/ai/conversations", {
          title,
          contextType: "general"
        });
        
        if (convRes.success && convRes.data) {
          const newConv = convRes.data;
          setConversations((prev) => [newConv, ...prev]);
          setActiveConversationId(newConv.id);
          activeConversationIdRef.current = newConv.id;
          currentConvId = newConv.id;
        } else {
          isNewConversationRef.current = false;
          throw new Error("Không thể khởi tạo cuộc hội thoại trong DB.");
        }
      }

      const res = await httpRequest.post(`/ai/conversations/${currentConvId}/messages`, {
        content: text
      });

      if (res.success && res.data) {
        if (res.data.streamed) {
          [4000, 10000, 18000].forEach((delay) => {
            setTimeout(() => {
              if (activeConversationIdRef.current === currentConvId) {
                fetchMessages(currentConvId);
              }
            }, delay);
          });
        }

        if (res.data.assistantMessage) {
          setIsGenerating(false);
          setIsPlanning(false);
          setPlanningStatus(null);
        }

        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== tempUserMsgId);
          const assistantMessage = res.data.assistantMessage;
          const recommendation = res.data.recommendation;

          const userMsgExists = filtered.some((m) => m.id === res.data.userMessage.id);
          const baseList = userMsgExists ? filtered : [...filtered, res.data.userMessage];

          if (assistantMessage) {
            const assistantMsgExists = baseList.some((m) => m.id === assistantMessage.id);
            if (assistantMsgExists) {
              return baseList.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      ...assistantMessage,
                      content: stripActionBlock(assistantMessage.content),
                      metadata: recommendation
                        ? { ...(assistantMessage.metadata || {}), recommendation }
                        : assistantMessage.metadata || {},
                    }
                  : m
              );
            }

            return [
              ...baseList,
              {
                ...assistantMessage,
                content: stripActionBlock(assistantMessage.content),
                metadata: recommendation
                  ? { ...(assistantMessage.metadata || {}), recommendation }
                  : assistantMessage.metadata || {},
              },
            ];
          }

          const placeholderExists = baseList.some((m) => m.id === res.data.assistantMessageId);
          if (placeholderExists) return baseList;

          return [
            ...baseList,
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
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      setIsPlanning(false);
      setPlanningStatus(null);
      showToast("Thao tác thất bại, vui lòng báo cáo admin.", "error");
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
    } finally {
      sendingRef.current = false;
    }
  };

  // Áp dụng đề xuất
  const handleExecuteAction = async (recommendationId) => {
    if (actionProcessingId) return;
    try {
      setActionProcessingId(recommendationId);
      const currentRecommendation = messages.find((msg) => msg.metadata?.recommendation?.id === recommendationId)?.metadata?.recommendation;
      const res = await httpRequest.post(`/ai/recommendations/${recommendationId}/execute`);
      if (res.success) {
        const isTrainingPlanAction = [
          "generate_training_plan",
          "update_training_plan",
          "skip_day",
          "swap_exercise",
          "adjust_volume",
          "deload",
          "reschedule"
        ].includes(currentRecommendation?.recommendationType);
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

        if (isTrainingPlanAction) {
          localStorage.setItem("aiCoachPlanUpdatedAt", new Date().toISOString());
          window.dispatchEvent(new CustomEvent("aiCoach:plan-updated"));
          setMessages((prev) => [
            ...prev,
            {
              id: `plan-applied-${recommendationId}`,
              role: "assistant",
              content: "Đã áp dụng lộ trình vào trang Lộ trình & Tracker. Bạn có thể mở lịch tập để kiểm tra từng buổi.",
              createdAt: new Date(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi đồng ý đề xuất:", err);
      showToast("Thao tác thất bại, vui lòng báo cáo admin.", "error");
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
      showToast("Thao tác thất bại, vui lòng báo cáo admin.", "error");
    } finally {
      setActionProcessingId(null);
    }
  };

  // Tải danh sách cuộc hội thoại ban đầu khi component mount hoặc userInfo thay đổi
  useEffect(() => {
    if (userInfo?.id) {
      const timer = setTimeout(() => {
        fetchConversations(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Tải danh sách khi đổi cuộc hội thoại
  useEffect(() => {
    if (activeConversationId && activeConversationId !== "temp-new") {
      if (isNewConversationRef.current) {
        isNewConversationRef.current = false;
        return;
      }
      fetchMessages(activeConversationId);
    } else {
      const timer = setTimeout(() => {
        setMessages([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeConversationId, fetchMessages]);

  // Kết nối Pusher
  useEffect(() => {
    if (!userInfo?.id) return;

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
      if (data.conversationId !== activeConversationIdRef.current) return;
      resetSafetyTimeout();
      
      streamingContentRef.current += data.chunk;
      const rawText = streamingContentRef.current;
      const hasActionStarted = /---ACTION---|```action|```json[\s\S]*?(type|payload|days|exerciseId)|\{[\s\S]*?(type|payload|days|exerciseId)/i.test(rawText);
      setIsPlanning(hasActionStarted);
      const actionType = getActionTypeFromText(rawText);
      if (actionType) {
        setPlanningStatus(getPlanningStatus(actionType));
      }
      
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === data.messageId);
        const cleanContent = stripActionBlock(streamingContentRef.current);
        if (index === -1) {
          return [
            ...prev,
            {
              id: data.messageId,
              role: "assistant",
              content: cleanContent,
              createdAt: new Date(),
            },
          ];
        } else {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            content: cleanContent,
          };
          return updated;
        }
      });
      setIsGenerating(true);
    });

    channel.bind("ai.done", (data) => {
      if (data.conversationId !== activeConversationIdRef.current) return;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      setIsPlanning(false);
      setPlanningStatus(null);
      
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
      if (data.conversationId !== activeConversationIdRef.current) return;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      setIsPlanning(false);
      setPlanningStatus(null);
      
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
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe(channelName);
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [userInfo?.id, stripActionBlock, resetSafetyTimeout, getActionTypeFromText, getPlanningStatus]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isGenerating,
    isPlanning,
    planningStatus,
    loadingConversations,
    loadingMessages,
    actionProcessingId,
    toast,
    fetchConversations,
    handleCreateNewConversation,
    handleDeleteConversation,
    handleSendMessage,
    handleExecuteAction,
    handleRejectAction,
    showToast,
  };
}
