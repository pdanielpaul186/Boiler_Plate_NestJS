import { Body, Controller, Logger, Post, UseGuards, Get, Request } from '@nestjs/common';
import { auth } from '../../auth.interface';
import { AuthService } from '../auth-service/auth-service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Role } from 'src/decorators/role/role.decorator';

@Controller('auth')
export class AuthControllerController {

    private readonly logger :  Logger = new Logger(AuthControllerController.name);

    constructor(
        private authService : AuthService
    ){}

    @Post()
    async signIn ( @Body() loginInfo : auth ) {
        return this.authService.signIn(loginInfo.username, loginInfo.password);
    }

    @UseGuards(AuthGuard, RoleGuard)
    @Get('profile')
    @Role( 'super-admin', 'admin', 'owner', 'write', 'read' )
    getProfile(@Request() req) {
        return req.user;
    }

}
