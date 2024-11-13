import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserDto } from '~/dto/';
import { LoginDto } from '~/dto/';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDBClient } from '~/utils';
import { SessionGuard } from './providers/guards/session.guard';
import { JwtGuard } from './providers/guards/jwt.guard';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionGuard: SessionGuard,
    private readonly jwtGuard: JwtGuard
  ) {
    this.supabase = SupabaseDBClient(this.configService);
  }

  async signup(userDto: UserDto) {
    const { email, firstName, lastName, username, password, phone } = userDto;

    try {
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert the new user using the supabase
      const { data, error } = await this.supabase
        .from('users')
        .insert([
          {
            email,
            first_name: firstName,
            last_name: lastName,
            username,
            password: hashedPassword,
            phone_number: phone,
          },
        ])
        .select();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      // Return the created user data
      return data[0];
    } catch (err) {
      throw new Error(`Internal server error: ${(err as Error).message}`);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trim spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Query Supabase to find the user by email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('id, email, password, first_name, last_name, username, is_admin, is_inactive')
      .eq('email', trimmedEmail)
      .eq('is_inactive', false)
      .single();

    if (error || !user) {
      //console.error('Supabase Error:', error);
      throw new UnauthorizedException('This User is non-existent!, contact Photoruum`s Admin if you think this is a mistake');
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Login credentials');
    }
    
    // if (password !== user.password) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    // Generate a JWT with user details and a secret key
    const token = this.jwtGuard.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
    );

    // Use the session guard to create a session
    await this.sessionGuard.createSession(user.id, token);

    // Return the user data and token
    return { user, token };
  }

  async adminLogin(loginDto: LoginDto) {
    const { email, password } = loginDto;
  
    // Trim spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
  
    // Check in `admins` table for admin user
    const { data: admin, error: adminError } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', trimmedEmail)
      .single();
  
    if (adminError || !admin) {
      throw new UnauthorizedException('Your Login attempt as an Admin is invalid, Retry again!');
    }
  
    // Verify password hash
    const isPasswordValid = await bcrypt.compare(trimmedPassword, admin.password);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Login credentials');
    }
  
    // Check if admin user exists in `users` table with is_admin = true
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('email', trimmedEmail)
      .eq('is_admin', true)
      .single();
  
    if (userError || !user) {
      throw new UnauthorizedException('No admin privileges set, contact the Photoruum Administrator');
    }
  
    // Generate JWT
    const token = this.jwtGuard.sign(
      { id: admin.id, email: admin.email, is_admin: user.is_admin }
    );
  
    // Create session for admin
    await this.sessionGuard.createSession(admin.id, token);
  
    // Hide the password before returning the response
    delete admin.password;
  
    // Return admin data (minus the password) and token
    return { admin, token };
  }  
}