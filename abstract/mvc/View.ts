import { Model } from "./Model";

export interface View {
    /**
     * Update the view with time
     * @param delta_ms 
     */
    update(delta_ms:number): void;
    /**
     * render the model with this view
     * @param model 
     */
    render(model: Model): void;
}