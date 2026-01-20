import { IsUUID, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MigrateDriverDto {
  @ApiProperty({
    description:
      'New client ID to migrate driver to. Set to null to make driver independent.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    nullable: true,
  })
  @ValidateIf((o) => o.newClientId !== null)
  @IsUUID('4', {
    message: 'newClientId must be a valid UUID when provided',
  })
  @IsOptional()
  newClientId: string | null;
}
