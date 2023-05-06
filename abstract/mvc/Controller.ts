import { ControllerResponse } from "./Response";

export interface Controller {
    update(delta_seconds: number): ControllerResponse;
}