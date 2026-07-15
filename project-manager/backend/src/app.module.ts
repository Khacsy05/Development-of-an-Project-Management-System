import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { TopicModule } from './modules/topics/topics.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { CapstonesModule } from './modules/capstones/capstones.module';
import { CouncilsModule } from './modules/councils/councils.module';

@Module({
  imports: [PrismaModule, FacultiesModule, TopicModule, UsersModule, ClassesModule, AcademicYearsModule, CapstonesModule, CouncilsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
