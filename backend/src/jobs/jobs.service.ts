import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(
        @InjectQueue('auction-settlement')
        private settlementQueue: Queue,
    ) { }

    /**
     * Schedule an auction settlement job.
     * The job will be delayed until the auction's endsAt time.
     */
    async scheduleSettlement(auctionId: string, endsAt: Date): Promise<void> {
        const delay = Math.max(0, new Date(endsAt).getTime() - Date.now());

        await this.settlementQueue.add(
            'settle',
            { auctionId },
            {
                delay,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000, // 1s, 5s, 15s
                },
                removeOnComplete: true,
                removeOnFail: false,
                jobId: `settle-${auctionId}`, // Prevent duplicate jobs
            },
        );

        this.logger.log(
            `Scheduled settlement for auction ${auctionId} in ${Math.round(delay / 1000)}s`,
        );
    }
}
