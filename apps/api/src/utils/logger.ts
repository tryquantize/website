import { WebSocketServer } from 'ws';
import { Server } from 'http';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'API' | 'DB' | 'AUTH' | 'AI' | 'ERROR' | 'PERF';
  message: string;
  details?: any;
}

class LogManager {
  private wss: WebSocketServer | null = null;
  private logs: LogEntry[] = [];

  init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/logs' });
    
    this.wss.on('connection', (ws) => {
      console.log('Admin connected to logs');
      // Send recent logs on connection
      this.logs.slice(-50).forEach(log => {
        ws.send(JSON.stringify(log));
      });
    });
  }

  log(type: LogEntry['type'], message: string, details?: any) {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };

    this.logs.push(logEntry);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500); // Keep last 500 logs
    }

    // Broadcast to all connected clients
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(logEntry));
        }
      });
    }
  }
}

export const logManager = new LogManager();