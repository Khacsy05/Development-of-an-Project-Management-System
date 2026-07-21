import { PartialType } from '@nestjs/mapped-types';
import { CreateCouncilsMemberDto } from './create-councils-member.dto';

export class UpdateCouncilsMemberDto extends PartialType(CreateCouncilsMemberDto) {}
