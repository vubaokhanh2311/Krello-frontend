import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private joinedBoards = new Set<string>();
  private isConnecting = false;

  connect() {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem("accessToken");

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      setTimeout(() => {
        this.isConnecting = false;
        this.joinedBoards.clear();

        const boardId = localStorage.getItem("currentBoardId");
        if (boardId) {
          this.emitJoin(boardId);
        }
      }, 50);
    });

    this.socket.on("disconnect", () => {
      this.isConnecting = false;
    });

    this.socket.on("connect_error", () => {
      this.isConnecting = false;
    });

    this.socket.io.on("reconnect_failed", () => {
      this.isConnecting = false;
    });
  }

  disconnect() {
    if (!this.socket) return;

    try {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    } catch (error) {
      console.error("Error disconnecting socket:", error);
    } finally {
      this.joinedBoards.clear();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  joinBoard(boardId: string) {
    if (!this.socket) return;

    localStorage.setItem("currentBoardId", boardId);

    if (this.joinedBoards.has(boardId)) {
      return;
    }

    if (!this.socket.connected) {
      const onConnect = () => {
        this.emitJoin(boardId);
        this.socket?.off("connect", onConnect);
      };
      this.socket.once("connect", onConnect);
      return;
    }

    this.emitJoin(boardId);
  }

  forceJoinBoard(boardId: string) {
    this.joinedBoards.delete(boardId);
    this.joinBoard(boardId);
  }

  private emitJoin(boardId: string) {
    if (!this.socket?.connected) return;

    if (this.joinedBoards.has(boardId)) {
      return;
    }

    this.socket.emit(
      "board:join",
      { boardId },
      (response?: { success: boolean; error?: string }) => {
        if (response?.success !== false) {
          this.joinedBoards.add(boardId);
        }
      }
    );
  }

  leaveBoard(boardId: string) {
    if (!this.socket || !this.joinedBoards.has(boardId)) return;

    this.socket.emit(
      "board:leave",
      { boardId },
      (response?: { success: boolean }) => {
        if (response?.success !== false) {
          this.joinedBoards.delete(boardId);
          localStorage.removeItem("currentBoardId");
        }
      }
    );
  }

  on<T = unknown>(event: string, handler: (payload: T) => void) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.removeAllListeners(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  emit<T = unknown>(
    event: string,
    data: any,
    callback?: (response: T) => void
  ) {
    if (!this.socket?.connected) return;

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
