import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const errorHandler = (error: any, message: string) => {
  if (error instanceof ConflictException) {
    throw error;
  }
  if (error instanceof NotFoundException) {
    throw error;
  }
  if (error instanceof UnauthorizedException) {
    throw error;
  }
  if (error instanceof BadRequestException) {
    throw error;
  }

  console.error(message, error);
  throw new InternalServerErrorException(message);
};
