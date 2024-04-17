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
    console.log(
      'generateQueue',
      this.configService.appConfig.REDIS_CONNECTION_STRING,
    );
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Bull(
        name,
        this.configService.appConfig.REDIS_CONNECTION_STRING,
      );
      if (callback) {
        queue.process(callback);
      }
      this.queues.set(name, queue);
    }
    queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} has completed with result: ${result}`);
    });

    queue.on('failed', (job, err) => {
      console.log(`Job ${job.id} has failed with error: ${err.message}`);
    });

    queue.on('active', (job) => {
      console.log(`Job ${job.id} is now active;`);
    });

    queue.on('waiting', (jobId) => {
      console.log(`Job ${jobId} is waiting to be processed`);
    });
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
