import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { InitialiserModule } from './modules/initialiser/initialiser.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.production', '.env'],
      isGlobal: true,
      validate: validate,
      ignoreEnvVars: true,
      ignoreEnvFile: false,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URL ||
        process.env.MONGODB_URI ||
        'mongodb://localhost:27017',
      {
        dbName: process.env.MONGO_DB_NAME || 'app_backend',
      },
    ),
    AuthModule,
    InitialiserModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
