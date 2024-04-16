import { Injectable } from '@nestjs/common';
import * as Bull from 'bull';

import { ConfigService } from '~/modules/config/config.service';

@Injectable()
export class QueuesManagerService {
  private queues: Map<string, Bull.Queue> = new Map();
  constructor(private configService: ConfigService) {}

  async generateQueue(
    name: string,
    callback?: (job: Bull.Job<any>, done: Bull.DoneCallback) => Promise<void>,
  ) {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Bull(
        name,
        this.configService.appConfig.REDIS_CONNECTION_STRING,
      );
      callback && queue.process(1, callback);
      this.queues.set(name, queue);
    }
    return queue;
  }

  async getJobsFromQueue(
    name: string,
    jobStatuses: Bull.JobStatus[],
  ): Promise<Bull.Job[]> {
    const queue: Bull.Queue = new Bull(
      name,
      this.configService.appConfig.REDIS_CONNECTION_STRING,
    );
    return await queue.getJobs(jobStatuses);
  }
}
