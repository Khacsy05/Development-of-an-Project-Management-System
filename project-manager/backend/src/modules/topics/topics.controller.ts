import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { TopicService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicQuery } from './dto/query-topic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('topics')


export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer", "Student","Admin")
  create(@Body() createTopicDto: CreateTopicDto,@Req() req:any) {
    return this.topicService.create(createTopicDto,req);
  }

  @Get()
  findAll(@Query() query: TopicQuery) {
    return this.topicService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto,@Req() req:any) {
    return this.topicService.update(+id, updateTopicDto,req);
  }

  @Patch(':id/approved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Lecturer")
  approvedTopic(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto,@Req() req:any) {
    return this.topicService.approvedTopic(+id, updateTopicDto,req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
