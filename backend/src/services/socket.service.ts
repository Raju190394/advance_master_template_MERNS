import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { prisma } from '../config/db';

interface AuthSocket extends Socket {
    user?: {
        userId: number;
        role: string;
    };
}

class SocketService {
    private io: SocketIOServer | null = null;
    private userSockets: Map<number, string[]> = new Map();

    initialize(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: env.CORS_ORIGIN,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.use((socket: AuthSocket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            try {
                const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number; role: string };
                socket.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: AuthSocket) => {
            if (socket.user) {
                const userId = socket.user.userId;
                const sockets = this.userSockets.get(userId) || [];
                sockets.push(socket.id);
                this.userSockets.set(userId, sockets);

                socket.join(`user:${userId}`);
                if (socket.user.role === 'admin' || socket.user.role === 'super_admin') {
                    socket.join('admins');
                }
            }

            socket.on('disconnect', () => {
                if (socket.user) {
                    const userId = socket.user.userId;
                    let sockets = this.userSockets.get(userId) || [];
                    sockets = sockets.filter(id => id !== socket.id);
                    if (sockets.length > 0) {
                        this.userSockets.set(userId, sockets);
                    } else {
                        this.userSockets.delete(userId);
                    }
                }
            });
        });
    }

    private getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }

    /**
     * Send a notification to a specific user
     */
    async sendToUser(userId: number, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        try {
            // Save to DB
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                },
            });

            // Emit real-time event
            this.getIO().to(`user:${userId}`).emit('notification', notification);
            return notification;
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    /**
     * Send a notification to all admins
     */
    async sendToAdmins(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        try {
            // Find all admins
            const admins = await prisma.user.findMany({
                where: { role: { in: ['admin', 'super_admin'] } },
                select: { id: true },
            });

            // Create notifications for all admins
            // Note: createMany is supported in MySQL
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title,
                    message,
                    type,
                })),
            });

            // Emit to admins room
            // We construct a mock notification object since createMany doesn't return the created objects
            // For better UX, we might want to fetch latest, but for speed we just send payload
            const mockNotification = {
                title,
                message,
                type,
                createdAt: new Date(),
                read: false,
            };

            this.getIO().to('admins').emit('notification', mockNotification);
        } catch (error) {
            console.error('Failed to send admin notification:', error);
        }
    }
}

export default new SocketService();
