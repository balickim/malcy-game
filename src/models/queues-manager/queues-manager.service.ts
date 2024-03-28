import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Bull from 'bull';
import Redis from 'ioredis';

@Injectable()
export class QueuesManagerService {
  private queues: Map<string, Bull.Queue> = new Map();
  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // TODO assign processors to all active or waiting jobs after server restart
  // async getAllSettlementRecruitmentQueueNames(): Promise<string[]> {
  //   const prefix = 'bull:settlement_';
  //   const queueNames = new Set<string>();
  //   let cursor = '0';
  //
  //   do {
  //     const reply = await this.redis.scan(
  //       cursor,
  //       'MATCH',
  //       `${prefix}*`,
  //       'COUNT',
  //       '1000',
  //     );
  //     cursor = reply[0];
  //     reply[1].forEach((key: string) => {
  //       const match = key.match(/^(bull:[^:]+)/);
  //       if (match && match[1]) {
  //         queueNames.add(match[1].replace('bull:', ''));
  //       }
  //     });
  //   } while (cursor !== '0');
  //
  //   return Array.from(queueNames);
  // }

  async generateQueue(
    name: string,
    callback?: (job: Bull.Job<any>, done: Bull.DoneCallback) => Promise<void>,
  ) {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Bull(
        name,
        this.configService.get<string>('REDIS_CONNECTION_STRING'),
      );
      callback && queue.process(1, callback);
      this.queues.set(name, queue);
    }
    return queue;
  }

  async getAllJobsFromQueue(name: string): Promise<Bull.Job[]> {
    const jobStatuses: Bull.JobStatus[] = ['active'];
    const queue: Bull.Queue = new Bull(
      name,
      this.configService.get<string>('REDIS_CONNECTION_STRING'),
    );
    return await queue.getJobs(jobStatuses);
  }
}
