import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  lastName: string;

  @ApiPropertyOptional({ description: "Friend's referral code" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

/** Refresh token may come from the body (mobile/API clients) or the refresh_token cookie (browsers). */
export class RefreshDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
