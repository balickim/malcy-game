import { SetMetadata } from '@nestjs/common';

export const IsWithinLocation = (settlementIdParam: string) =>
  SetMetadata('settlementIdParam', settlementIdParam);
