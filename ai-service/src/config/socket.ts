import http from 'http'
import { Server } from 'socket.io'
import { Logger } from './logger';
import { handleMessages } from '../handler/message.handler';



let io: Server;
const logger = Logger.getInstance()


export function initializeSocket(server: http.Server): Server {
  //  const activeSession: Map<string, string> = new Map();

    io = new Server(server, {
    cors: {
      origin: '*', // change in production
    },
  })

  io.on('connection', (socket) => {
   logger.info('Client connected:', socket.id);


   socket.on('patient-message', async (payload, callback) => {
    // verify that the payload is passed
    try {
        if (!payload) {
        return callback({
          type: "ERROR",
          code: "MESSAGE_UNIDENTIFIED",
          message: "message is required",
        }); 
      }      
    } catch (error) {
        callback({
          type: "ERROR",
          code: "INTERNAL_ERROR",
          message: "Invalid server response",
        });
      
    }
    // verify that the payload is a valid json
     try {
       const parsedData = JSON.parse(payload)

        if (!parsedData) {
        return callback({
          success: false,
          error: "message is an invalid json",
        }); 
      } 
    } catch (error) {
        callback({
        success: false,
        error: "Internal error",
      });
    }
    // verify that the message has a type
    try {
        if (!payload.type) {
        return callback({
          type: "ERROR",
          code: "TYPE_UNIDENTIFIED",
          message: "every message must include a type field",
        }); 
      } 
      
    } catch (error) {
        callback({
          type: "ERROR",
          code: "INTERNAL_ERROR",
          message: "Invalid server response",
        });
      
    }

    // verify user data is present
   if (!socket.data.userId || !socket.data.role ) {
      return callback({
          type: "ERROR",
          code: "NOT_AUTHENTICATED",
          message: "Authenticate before sending patient messages.",
        })
     }

     // route message to handler
     try {
        await handleMessages(socket.data.userId, io, socket.id, payload)
     } catch (error) {
       return callback({
          type: "ERROR",
          code: "SERVER_ERROR",
          message: "An internal error occurred. Please try again.",
        })
     }
   })
    socket.on('disconnect', () => {
      logger.info('Client disconnected:', socket.id);
    });
  });

  return io;
}


export function getIO () {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
  return io;
}
