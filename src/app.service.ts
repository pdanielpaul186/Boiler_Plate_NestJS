import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello FinOPs and BillOPs Tool 😊';
  }
}
