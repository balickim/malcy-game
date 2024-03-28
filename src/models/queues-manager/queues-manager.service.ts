import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Bull from 'bull';

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
        this.configService.get<string>('REDIS_CONNECTION_STRING'),
      );
      callback && queue.process(1, callback);
      this.queues.set(name, queue);
    }
    return queue;
  }

  async getAllJobsFromQueue(
    name: string,
    callback?: (job: Bull.Job<any>, done: Bull.DoneCallback) => Promise<void>,
  ): Promise<Bull.Job[]> {
    const jobStatuses: Bull.JobStatus[] = ['active'];
    const queue: Bull.Queue = new Bull(
      name,
      this.configService.get<string>('REDIS_CONNECTION_STRING'),
    );
    callback && queue.process(1, callback);
    return await queue.getJobs(jobStatuses);
  }
}
