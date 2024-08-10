import {Socket} from 'socket.io';
import {RoomManager} from './RoomManager';

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    this.users.push({name, socket});
    this.queue.push(socket.id);
    this.initHandlers();
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((user) => user.socket.id !== socketId);

    this.queue = this.queue.filter((q) => q! == socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) return;

    const user1 = this.users.find(
      (user) => user.socket.id === this.queue.pop()
    );

    const user2 = this.users.find(
      (user) => user.socket.id === this.queue.pop()
    );

    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2);
  }

  initHandlers(socket: Socket) {
    socket.on('offer', (sdp, roomId) => {
      this.roomManager.onOffer(roomId, sdp);
    });

    socket.on('answer', (sdp, roomId) => {
      this.roomManager.onAnswer(roomId, sdp);
    });
  }
}
