import { AssetManager } from "../../../../assets";
import { AudioPlayer } from "../../../../audio";

export class MenuGlobals {
    // 
    public next_id = 1;
    // Visual settings
    public primary_color = "#000000";
    public background_color = "#FFFFFF";
    // Audio settings
    public audio_player: AudioPlayer | null = null;
    public select_sound: string | null = null;
    public asset_manager: AssetManager | null = null;
}