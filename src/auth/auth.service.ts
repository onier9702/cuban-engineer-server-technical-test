import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Auth } from './entities/auth.entity';

import { CreateAuthDto, LoginAuthDto, UpdateAuthDto } from './dto';

import { Message } from '../interfaces/message';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    private readonly jwtService: JwtService // default Nest Service to generate JWT
  ) {}

  // Create a USER
  async create(createAuthDto: CreateAuthDto) {

    const {  email, password, name } = createAuthDto;

    try {

      const user = await this.authRepository.findOneBy( { email } );
      
      if (user) {
        throw new BadRequestException(`Email: ${user.email} already exists on this database.`);
      }
      
      const newUser = this.authRepository.create({ 
        name,
        email,
        password: bcrypt.hashSync(password, 10)
      });

      const { uid, password: passwordDB, isActive, ...restUserDB } = await this.authRepository.save(newUser);

      return {
        ...restUserDB,
        uid,
        token: this.generateJWT( { uid: uid.toString()} )
      }

    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // Login User
  async login(loginAuthDto: LoginAuthDto) {

    const { password, email } = loginAuthDto;

    try {

      const user = await this.authRepository.findOneBy( { email } );
      if (!user) { 
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: passwordDB, isActive, uid, ...restUser } = user;

      // Verify password
      const isValidPassword = bcrypt.compareSync( password, passwordDB );
      if ( !isValidPassword ) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        ...restUser,
        uid,
        token: this.generateJWT( { uid: uid.toString()} )
      }

    } catch (error) {
      this.handleErrorsOnDB(error);
    }

  }

  // revalidateToken 
  async revalidateToken(user: Auth) {
    return {
      ...user,
      token: this.generateJWT( { uid: user.uid.toString() } )
    };
  }

  async findOne(id: number) {
    const user = await this.authRepository.findOneBy( {uid: id} );
    if (!user) throw new BadRequestException(`User with ID: ${id} not found`);
    return user;
  }

  // UPDATE ONE USER BY ID
  async update(id: number, updateAuthDto: UpdateAuthDto) {

    const { password, email, ...restUpdateUser } = updateAuthDto;
    const oldUser = await this.findOne(id);

    const updatedUser = await this.authRepository.preload({
      ...oldUser,
      ...restUpdateUser,
      email: (email) ? email : oldUser.email,
      password: (password) ? bcrypt.hashSync(password, 10) : oldUser.password
    })

    const { uid, isActive, password: newPassword, ...restUserDB } = await this.authRepository.save(updatedUser);
    return {
      ...restUserDB,
      uid,
      token: this.generateJWT( { uid: uid.toString()} )
    }
  }

  // SET INACTIVE USER BY ID
  async remove(id: number): Promise<Message> {

    try {

      const user = await this.authRepository.findOneBy({uid: id});
      if (!user) {
        throw new BadRequestException(`User with id: ${id} not found.`)
      }

      await this.authRepository.update(
        { uid: id },
        { isActive: false },
      );

      return {
        msg: 'User have been desactivated.'
      }
      
    } catch (error) {
      this.handleErrorsOnDB(error);
    }
  }

  // ----------------- HELPERS --------------------

  private generateJWT( payload: JwtPayload ): string {
    return this.jwtService.sign( payload );
  }

  private handleErrorsOnDB( err: any ) {
    if (err.status === 400) {
      throw new BadRequestException(err.response.message);
    }
    if (err.status === 401) {
      throw new UnauthorizedException(err.response.message);
    }
    if ( err.errno === 1062 ) {
      throw new BadRequestException('Email already exists on database.');
    }
    if ( err.errno === 1052 ) {
      throw new BadRequestException(err.sqlMessage)
    }
    console.log(err);
    throw new InternalServerErrorException('Please check server Auth--logs-- in auth service, error not handled yet');
  }

}
