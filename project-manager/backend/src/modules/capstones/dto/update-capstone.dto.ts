import { PartialType } from '@nestjs/mapped-types';
import { CreateCapstoneDto } from './create-capstone.dto';

export class UpdateCapstoneDto extends PartialType(CreateCapstoneDto) {}
