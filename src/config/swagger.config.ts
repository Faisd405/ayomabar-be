import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const application = {
  title: 'Nest API Documentation',
  description: 'The Nest API description',
} as const;

/**
 * Configures Swagger for the provided NestJS application.
 *
 * @param app {INestApplication} - The NestJS application instance.
 * @param apiVersion {string} - Optional version of the API.
 */
export function swaggerConfig(
  app: INestApplication,
  apiVersion: string,
  environment: string,
) {
  const setup = new DocumentBuilder()
    .setTitle(`${application.title} (${environment})`)
    .setDescription(application.description)
    .setVersion(apiVersion)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Bearer',
    })
    .build();

  const document = SwaggerModule.createDocument(app, setup);

  SwaggerModule.setup(`/api/v${apiVersion}/docs`, app, document);
}
