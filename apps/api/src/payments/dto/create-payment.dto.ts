import { IsIn, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsIn(['manual', 'stripe'])
  provider?: 'manual' | 'stripe';
}
