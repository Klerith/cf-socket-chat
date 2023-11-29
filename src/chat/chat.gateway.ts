import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  
  @WebSocketServer()
  server: Server;

  
  constructor(private readonly chatService: ChatService) {}


  onModuleInit() {
    
    this.server.on( 'connection', ( socket: Socket ) => {

      const { token, name, email = 'fernando@google.com' } = socket.handshake.auth;

      if ( !name ) {
        socket.disconnect();
        return;
      }

      this.chatService.onClientConnected({ id: socket.id, name: name });

      // console.log('Cliente conectado', socket.id );
      socket.join( email );
      // socket.emit('welcome-message', 'Bienvenido a nuestro chat');

      this.server.emit('on-clients-changed', this.chatService.getClients() )
      
      
      
      socket.on('disconnect', () => {
        // console.log('Cliente desconectado', socket.id );
        this.chatService.onClientDisconnected( socket.id );
        this.server.emit('on-clients-changed', this.chatService.getClients() )
      })


    })




  }



  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ) {
    
    const { name } = client.handshake.auth; 

    if ( !message ) {
      return;
    }

    this.server.to('fernando@google.com').emit('on-message','Este es un mensaje privado');


    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: name
    })


  }




}
