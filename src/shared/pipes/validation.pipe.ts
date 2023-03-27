import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  Paramtype,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private errorMessages: { [key: string]: string[] | string } = {};
  private static isEmptyNullObject(value: any) {
    // by default the value that we have here if it's an object, it's a prototype of null object, therefore we have to check if that parsed object contains any attributes or not.
    return Object.getPrototypeOf(value) === null && Object.keys(value).length === 0;
  }

  private static isCustomMetaType(type: Paramtype) {
    return type === 'custom';
  }
  private static isUndefinedValueWithMetatypePresent(value: any, metatype?: Type<any>) {
    return metatype && value === undefined;
  }
  private static isOptionalPayload(value: any, metatype?: Type<any>) {
    return ValidationPipe.isUndefinedValueWithMetatypePresent(value, metatype);
  }
  private static isEmptyPayload(type: Paramtype, value: any) {
    if (type === 'query') {
      return false;
    }
    if (value === undefined || value === null) {
      return true;
    }
    return ValidationPipe.isEmptyNullObject(value) || (value instanceof Object && ValidationPipe.isEmpty(value));
  }
  private static isRequestPayload(metatype?: Type<any>) {
    return metatype && metatype.prototype.constructor.name.includes('DTO');
  }
  private static isPrimitiveType(value: any) {
    return ['string', 'boolean', 'number'].includes(typeof value);
  }
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    // metatype: Validator Class or the object that we type-hinted our parameter with at our controller function.
    // type: type of that object (might be params, query, body, custom)
    if (ValidationPipe.isCustomMetaType(type)) {
      return value;
    }

    if (ValidationPipe.isOptionalPayload(value, metatype)) {
      return value;
    }
    if (ValidationPipe.isPrimitiveType(value)) {
      return value;
    }
    // if the parameter at the controller function is type-hinted as query, and we haven't passed any values as query string
    // we will skip validation for that as they're optional.
    if (ValidationPipe.isEmptyPayload(type, value)) {
      throw new HttpException('Validation failed: No body submitted', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // in case of response bypass validation and return the DTO directly.
    if (!ValidationPipe.isRequestPayload(metatype)) {
      return value;
    }
    // If there is a class to be validated against and there is no value(primitive such as string) submitted, then we should throw exception to avoid class-transformer to construct a class with nullish values.

    if (ValidationPipe.isUndefinedValueWithMetatypePresent(value, metatype) && type === 'query') {
      return value;
    }
    // for parsing query string of rest api and parse the query to an object of filter and prepare to validate Object

    const object = plainToInstance(metatype, value, {
      //   excludeExtraneousValues: true,
    });

    // If the plain object that we are switching to an object is returning undefined, or it's returning something that's not instance of the metatype(original class that we want to cast our plain object to)
    // then we have to return with validation failed that the body is wrong.
    if (!object || !(object instanceof metatype?.prototype.constructor)) {
      throw new HttpException('Validation failed: No body submitted', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const errors = await validate(object);
    if (errors.length > 0) {
      this.errorMessages = {
        message: 'Validation Error!',
      };
      throw new HttpException(this.formatErrors(errors), HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return object;
  }

  private formatErrors(errors: ValidationError[]) {
    errors.forEach(err => {
      if (err.constraints) {
        const messages = Object.keys(err.constraints).map(key => {
          return err.constraints[key];
        });
        const prop = err.property as keyof typeof err.constraints as string;
        this.errorMessages[prop] = messages;
      }

      if (err.children && err.children.length) {
        this.formatErrors(err.children);
      }
    });
    return this.errorMessages;
  }
  private static isEmpty(value: any) {
    return Object.keys(value).length === 0;
  }
}
