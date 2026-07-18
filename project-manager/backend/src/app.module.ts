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
import { AuthModule } from './modules/auth/auth.module';
import { CapstonesRequestModule } from './modules/capstones-request/capstones-request.module';
import { CapstonesSubmissionModule } from './modules/capstones-submission/capstones-submission.module';

@Module({
  imports: [PrismaModule, FacultiesModule, TopicModule, UsersModule, ClassesModule, AcademicYearsModule, CapstonesModule, CouncilsModule, AuthModule, CapstonesRequestModule, CapstonesSubmissionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
