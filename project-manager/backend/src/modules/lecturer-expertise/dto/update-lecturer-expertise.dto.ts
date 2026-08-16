import { PartialType } from '@nestjs/mapped-types';
import { SaveLecturerExpertiseDto } from './create-lecturer-expertise.dto';

export class UpdateLecturerExpertiseDto extends PartialType(SaveLecturerExpertiseDto) { }
