/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Controller } from '@nestjs/common';

export function BaseController(basePath: string) {
    return (target: Function) => {
        // Prepend the base path to the controller's route
        const controllerPath = `api/v1/${basePath}`;
        Controller(controllerPath)(target);
    };
}