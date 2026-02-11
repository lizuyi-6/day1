import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'workflow',
})
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkflowGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-workflow')
  handleJoinWorkflow(client: Socket, workflowId: string) {
    client.join(workflowId);
    this.logger.log(`Client ${client.id} joined workflow ${workflowId}`);
    return { event: 'joined', data: workflowId };
  }

  @SubscribeMessage('leave-workflow')
  handleLeaveWorkflow(client: Socket, workflowId: string) {
    client.leave(workflowId);
    this.logger.log(`Client ${client.id} left workflow ${workflowId}`);
    return { event: 'left', data: workflowId };
  }

  // Method to emit node execution status updates
  emitNodeStatus(workflowId: string, nodeId: string, status: string, details?: any) {
    this.server.to(workflowId).emit('node-status', {
      nodeId,
      status,
      timestamp: Date.now(),
      ...details,
    });
  }

  // Method to emit workflow execution logs
  emitExecutionLog(workflowId: string, log: any) {
    this.server.to(workflowId).emit('execution-log', log);
  }
}
