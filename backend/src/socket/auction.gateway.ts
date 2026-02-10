import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
    },
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Track viewer counts per auction: auctionId -> Set<socketId>
    private auctionViewers: Map<string, Set<string>> = new Map();

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (token) {
                const payload = this.jwtService.verify(token);
                (client as any).userId = payload.sub;
                (client as any).userEmail = payload.email;
            }
        } catch (error) {
            // Allow unauthenticated connections for viewing
            console.log('[WS] Client connected (unauthenticated)');
        }
    }

    handleDisconnect(client: Socket) {
        // Remove from all auction rooms
        this.auctionViewers.forEach((viewers, auctionId) => {
            if (viewers.has(client.id)) {
                viewers.delete(client.id);
                this.server.to(`auction:${auctionId}`).emit('USER_LEFT', {
                    auctionId,
                    viewers: viewers.size,
                });
            }
        });
    }

    @SubscribeMessage('join_auction')
    handleJoinAuction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { auctionId: string },
    ) {
        const { auctionId } = data;
        const room = `auction:${auctionId}`;

        client.join(room);

        // Track viewers
        if (!this.auctionViewers.has(auctionId)) {
            this.auctionViewers.set(auctionId, new Set());
        }
        this.auctionViewers.get(auctionId)!.add(client.id);

        const viewerCount = this.auctionViewers.get(auctionId)!.size;

        // Broadcast to room
        this.server.to(room).emit('USER_JOINED', {
            auctionId,
            viewers: viewerCount,
        });

        return { event: 'joined', data: { auctionId, viewers: viewerCount } };
    }

    @SubscribeMessage('leave_auction')
    handleLeaveAuction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { auctionId: string },
    ) {
        const { auctionId } = data;
        const room = `auction:${auctionId}`;

        client.leave(room);

        // Track viewers
        const viewers = this.auctionViewers.get(auctionId);
        if (viewers) {
            viewers.delete(client.id);
            this.server.to(room).emit('USER_LEFT', {
                auctionId,
                viewers: viewers.size,
            });
        }
    }

    /**
     * Emits a NEW_BID event to all clients in an auction room.
     * Called by BidsService AFTER transaction commit.
     */
    emitNewBid(
        auctionId: string,
        bidData: {
            id: string;
            amount: number;
            bidder: { id: string; email: string; name: string };
            placedAt: Date;
        },
    ) {
        const viewers = this.auctionViewers.get(auctionId)?.size || 0;
        this.server.to(`auction:${auctionId}`).emit('NEW_BID', {
            auctionId,
            bid: bidData,
            currentPrice: bidData.amount,
            viewers,
        });
    }

    /**
     * Emits AUCTION_ENDED event when settlement worker completes.
     */
    emitAuctionEnded(
        auctionId: string,
        winner: { id: string; email: string; name: string } | null,
        finalPrice: number,
    ) {
        this.server.to(`auction:${auctionId}`).emit('AUCTION_ENDED', {
            auctionId,
            winner,
            finalPrice,
        });
    }

    /**
     * Emits BID_REJECTED event to a specific user when their bid fails.
     */
    emitBidRejected(
        auctionId: string,
        userId: string,
        reason: string,
    ) {
        // Find the user's socket(s) and emit directly to them
        const sockets = this.server.sockets.sockets;
        sockets.forEach((socket) => {
            if ((socket as any).userId === userId) {
                socket.emit('BID_REJECTED', {
                    auctionId,
                    reason,
                });
            }
        });
    }
}
