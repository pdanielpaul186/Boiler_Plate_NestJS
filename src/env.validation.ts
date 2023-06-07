import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsNotEmpty, IsEmail, IsAlphanumeric } from 'class-validator';
import { Logger } from '@nestjs/common'

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'testing',
}

class EnvironmentVariables {

    @IsEnum(Environment)
    @IsNotEmpty()
    NODE_ENV: Environment;

    @IsNumber()
    @IsNotEmpty()
    PORT: number;
    
    @IsString()
    @IsNotEmpty()
    MONGO_URL: string;

    @IsNotEmpty()
    // @IsIP()
    SQL_HOSTNAME: string;

    @IsString()
    @IsNotEmpty()
    SQL_USERNAME: string;
    
    @IsNumber()
    @IsNotEmpty()
    SQL_PORT: number;
    
    @IsString()
    @IsNotEmpty()
    SQL_PASSWORD: string;

    @IsEmail()
    @IsNotEmpty()
    admin_username: string;

    @IsString()
    @IsNotEmpty()
    admin_password: string;

    @IsNumber()
    @IsNotEmpty()
    salt_rounds: number;

    @IsAlphanumeric()
    @IsNotEmpty()
    secret_key: string;

    @IsNumber()
    @IsNotEmpty()
    expires_in: number;

}

export function validate(config: Record<string, unknown>) {

    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    )

    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if ( errors.length <= 0 ) {
        Logger.log("No errors found in loading environment variables !!!!", validate.name);
    } else {
        throw new Error(errors.toString());
    }
    
    return validatedConfig;

}