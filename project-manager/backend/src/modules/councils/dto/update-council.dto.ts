import { PartialType } from '@nestjs/mapped-types';
import { CreateCouncilDto } from './create-council.dto';

export class UpdateCouncilDto extends PartialType(CreateCouncilDto) {}
