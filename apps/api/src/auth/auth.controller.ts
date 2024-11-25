import { Body, Post, HttpException, HttpStatus, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto, LoginDto, GitHubLoginDto } from '~/dto';
import { BaseController } from '~decorators/version.decorator';
// import { SkipThrottle, Throttle } from '@nestjs/throttler';

@BaseController('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    // @Throttle('short') // Applies the short throttler I defined in app.module.ts
    @Post('signup')
    async signup(@Body() userDto: UserDto) {
        try {
            const user = await this.authService.signup(userDto);
            return { message: 'User created successfully', user };
        } catch (error) {
            throw new HttpException((error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const result = await this.authService.login(loginDto);
            return { message: 'Login successful', ...result };
        } catch (error) {
            throw new HttpException((error as Error).message, HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('github-login')
    async githubLogin(@Body() githubLoginDto: GitHubLoginDto) {
        try {
            const result = await this.authService.githubLogin(githubLoginDto);
            return { ok: true, ...result };
        } catch (error) {
            throw new HttpException((error as Error).message, HttpStatus.UNAUTHORIZED);
        }
    }
}

