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
import { CouncilEvalutionModule } from './modules/councils-evaluation/councils-evaluation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CouncilsMembersModule } from './modules/councils-members/councils-members.module';

@Module({
  
  imports: [ 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Đường dẫn tĩnh trên URL
    }),
    PrismaModule, FacultiesModule, TopicModule, UsersModule, ClassesModule, AcademicYearsModule, CapstonesModule, CouncilsModule, AuthModule, CapstonesRequestModule, CapstonesSubmissionModule, CouncilEvalutionModule, CouncilsMembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
