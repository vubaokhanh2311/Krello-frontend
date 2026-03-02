import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private joinedBoards = new Set<string>();
  private isConnecting = false;

  private getToken() {
    const remember = localStorage.getItem("rememberMe") === "true";
    const storage = remember ? localStorage : sessionStorage;
    return storage.getItem("accessToken");
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,

      auth: (cb) => {
        const token = this.getToken();
        cb({ token });
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      this.isConnecting = false;

      this.joinedBoards.clear();

      const lastBoard = localStorage.getItem("currentBoardId");
      if (lastBoard) {
        this.emitJoin(lastBoard);
      }
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
    }

    this.joinedBoards.clear();
    this.socket = null;
    this.isConnecting = false;
  }

  joinBoard(boardId: string) {
    if (!this.socket) return;

    localStorage.setItem("currentBoardId", boardId);

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

    if (this.joinedBoards.has(boardId)) return;

    this.socket.emit(
      "board:join",
      { boardId },
      (res?: { success: boolean; error?: string }) => {
        if (res?.success === false) {
          console.error("Join board failed:", res.error);
          return;
        }

        this.joinedBoards.add(boardId);
      },
    );
  }

  leaveBoard(boardId: string) {
    if (!this.socket || !this.joinedBoards.has(boardId)) return;

    this.socket.emit(
      "board:leave",
      { boardId },
      (res?: { success: boolean }) => {
        if (res?.success !== false) {
          this.joinedBoards.delete(boardId);
          localStorage.removeItem("currentBoardId");
        }
      },
    );
  }

  on<T = unknown>(event: string, handler: (data: T) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (!this.socket) return;

    if (handler) this.socket.off(event, handler);
    else this.socket.removeAllListeners(event);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  getSocketId() {
    return this.socket?.id;
  }

  emit<T = unknown>(
    event: string,
    data: any,
    callback?: (response: T) => void,
  ) {
    if (!this.socket?.connected) return;

    if (callback) this.socket.emit(event, data, callback);
    else this.socket.emit(event, data);
  }
}

export default new SocketService();
