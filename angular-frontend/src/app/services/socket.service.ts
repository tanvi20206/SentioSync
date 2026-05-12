import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        autoConnect: true,
      });
      this.socket.on('connect', () => console.log('⚡ Socket connected'));
      this.socket.on('disconnect', () => console.log('❌ Socket disconnected'));
    }
  }

  joinRoom(userId: string): void {
    this.socket?.emit('join_room', userId);
  }

  startMockFeed(userId: string): void {
    this.socket?.emit('start_mock_feed', userId);
  }

  stopMockFeed(): void {
    this.socket?.emit('stop_mock_feed');
  }

  onNewFeedItem(): Observable<any> {
    return new Observable((observer) => {
      this.socket?.on('new_feed_item', (data: any) => observer.next(data));
    });
  }

  onSentimentUpdate(): Observable<any> {
    return new Observable((observer) => {
      this.socket?.on('sentiment_update', (data: any) => observer.next(data));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
