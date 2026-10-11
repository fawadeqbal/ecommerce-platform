import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { PaymentMethod, PlaceOrderInput } from '@ecommerce/types';
import { ShippingAddressDto } from '../../users/dto/address.dto';

export class PlaceOrderDto implements PlaceOrderInput {
  @ApiPropertyOptional({ description: 'Required for guest checkout' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Saved address id (signed-in customers)' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ type: ShippingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  address?: ShippingAddressDto;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() saveAddress?: boolean;

  @ApiProperty({ enum: ['COD'], description: 'Online payments arrive with the Payments step' })
  @IsIn(['COD'])
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(500) customerNote?:
    | string
    | null;

  @ApiProperty({ description: 'Random id per checkout attempt' })
  @IsString()
  @Length(8, 100)
  idempotencyKey: string;
}
