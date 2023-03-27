import { SchedulerRegistry } from '@nestjs/schedule';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronManager {
  constructor(
    private readonly scheduler: SchedulerRegistry,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly config: ConfigService
  ) {}

  addCronJob(pattern: string, name: string, callback: () => void) {
    const job = new CronJob(pattern, async () => {
      const now = new Date().toLocaleString('en-us');
      this.logger.log(`Dispatching ${name} CRONJOB: ${now} for client: ${this.config.get('app.name')}`);
      try {
        await callback();
      } catch (e) {
        this.logger.error(`cron ${name} failed`, (e as Error).stack, {
          error: {
            timestamp: new Date().toISOString(),
            message: (e as Error).message,
            errorName: (e as Error).name,
            cronName: name,
            environment: this.config.get('app.env'),
            version: this.config.get('app.version'),
          },
        });
        return;
      }
      this.logger.log(`Finished dispatching ${name} CRONJOB at: ${now} for client: ${this.config.get('app.name')}`);
    });
    this.scheduler.addCronJob(name, job);
    job.start();
  }
}
