import { MusicAsset, SoundAsset } from "../assets";


interface MusicQueueItem {
    name: string;
    music: MusicAsset;
    repeat: boolean;
    // fade_in: number;
}

/**
 * A global audio player that can be used to play audio files loaded with the asset manager.
 * Prevents too many concurrent invocations of audio file.
 * 
 * @category Audio
 */
export class AudioPlayer {
    public readonly MAX_SFX_CHANNELS = 8;
    public readonly MAX_MUSIC_CHANNELS = 2;
    //
    protected _sfx = new AudioSfxPlayer(this);
    protected _music = new AudioMusicPlayer(this);

    constructor() { }

    public get music(): AudioMusicPlayer {
        return this._music;
    }

    public get sfx(): AudioSfxPlayer {
        return this._sfx;
    }
}

abstract class AudioPlayerBase {
    protected _volume = 1;
    protected _is_muted = false;

    constructor(
        public readonly audioPlayer: AudioPlayer,
    ) {
    }

    public get volume(): number {
        return this._volume;
    }

    public set volume(volume: number) {
        this._volume = volume;
        this.updateChannelVolume();
    }

    public get is_muted(): boolean {
        return this._is_muted;
    }

    public set is_muted(muted: boolean) {
        this._is_muted = muted;
        this.updateChannelVolume();
    }

    public toggleMuted() {
        this.is_muted = !this.is_muted;
    }

    protected abstract updateChannelVolume(): void;
}

/**
 * Handles the Music.
 */
class AudioMusicPlayer extends AudioPlayerBase {
    protected channels: HTMLAudioElement[] = [];
    protected queue: MusicQueueItem[] = [];
    protected active: MusicQueueItem | null = null;
    protected stopped = false;

    public constructor(
        readonly audioPlayer: AudioPlayer,
    ) {
        super(audioPlayer);
        this.volume = 0.1;
    }

    /**
     * 
     * @returns A unused audio element to play a music.
     */
    protected getFreeChannel(): HTMLAudioElement | null {
        for (const channel of this.channels) {
            if (channel.paused) {
                return channel;
            }
        }
        if (this.channels.length > this.audioPlayer.MAX_SFX_CHANNELS) {
            // console.warn(`Sound ${this.name} has too concurrent invocations`);
            return null;
        }
        const audioElement = document.createElement("audio");
        audioElement.addEventListener("playing", () => { });
        audioElement.addEventListener("pause", () => {
            if (this.stopped) return;
            this.playNext();
        });
        this.channels.push(audioElement);
        return audioElement;
    }

    /**
     * Plays the music asset.
     * 
     * @param audio 
     * @returns The audio element that is playing the audio file.
     */
    public queueNext(audio: MusicQueueItem | MusicAsset | string, options: Partial<Exclude<MusicQueueItem, "music">> = {}): HTMLAudioElement | null {
        this.stopped = false;
        if (typeof audio === "string") {
            audio = game.assets.getMusic(audio);
        }
        if (audio instanceof MusicAsset) {
            audio = Object.assign({
                music: audio,
                name: audio.name,
                repeat: true
            }, options);
        }
        this.queue.push(audio);
        // if nothing is playing right now start playing
        if (!this.active) {
            return this.playNext();
        }
        return null;
    }

    /**
     * Play the next element in the queue.
     * @returns 
     */
    public playNext(): HTMLAudioElement | null {
        const channel = this.getFreeChannel();
        if (!channel) return null;
        const item = this.queue.shift();
        if (!item) {
            const previous = this.active;
            this.active = null;
            // no more items in the queue
            // repeat the active element if requested
            if (previous && previous.repeat) {
                return this.queueNext(previous);
            }
            // nothing to play
            return null;
        };
        this.active = item;
        channel.src = item.music.url;
        channel.play();
        channel.volume = this.volume;
        console.log(`Now playing: ${item.name}`);
        return channel;
    }

    /**
     * Recalculate and updates the volume of all the music channels.
     * */
    protected updateChannelVolume() {
        for (const channel of this.channels) {
            channel.volume = this.is_muted ? 0 : this.volume;
        }
    }

    /**
     * Stops all the music channels.
     */
    public stop() {
        this.stopped = true;
        for (const channel of this.channels) {
            channel.pause();
        }
    }

    /**
     * Resumes the music channels.
     */
    public play() {
        this.stopped = false;
        this.playNext();
    }
}


/**
 * Handles the sound effects.
 */
class AudioSfxPlayer extends AudioPlayerBase {
    protected channels: HTMLAudioElement[] = [];
    protected active_channel_count = 0;

    public constructor(
        readonly audioPlayer: AudioPlayer,
    ) {
        super(audioPlayer);
        this.volume = 0.3;
    }


    /**
     * 
     * @returns A unused audio element to play a sound effect.
     */
    protected getFreeChannel(): HTMLAudioElement | null {
        for (const channel of this.channels) {
            if (channel.paused) {
                return channel;
            }
        }
        if (this.channels.length > this.audioPlayer.MAX_SFX_CHANNELS) {
            // console.warn(`Sound ${this.name} has too concurrent invocations`);
            return null;
        }
        const audioElement = document.createElement("audio");
        audioElement.addEventListener("playing", () => {
            this.active_channel_count++;
            this.updateChannelVolume();
        });
        audioElement.addEventListener("ended", () => {
            this.active_channel_count--;
            this.updateChannelVolume();
        });
        this.channels.push(audioElement);
        this.updateChannelVolume();
        return audioElement;
    }

    /**
     * Recalculate and updates the volume of all the sound effect channels.
     * @returns the new volume of the sound effect channels.
     */
    protected updateChannelVolume(): number {
        if (this.active_channel_count === 0) return this.volume;
        const volume = this._is_muted
            ? 0
            : (2 / (this.active_channel_count + 1)) * this.volume;
        for (const channel of this.channels) {
            channel.volume = volume;
        }
        return volume;
    }

    /**
     * Plays the audio file with the given name.
     *  
     * @param name The name of the audio file to play.
     * @returns The audio element that is playing the audio file.
     * @throws An error if the audio file is not loaded.
     * @throws An error if there are too many concurrent invocations of the audio file.
     * @category Audio
     * @example
     * ```typescript
     * const audioPlayer = new AudioPlayer();
     * audioPlayer.play("myAudioFile");
     * ```
     **/
    public play(audio: SoundAsset | string): HTMLAudioElement | null {
        if (typeof audio === "string") {
            audio = game.assets.getSound(audio);
        }
        const channel = this.getFreeChannel();
        if (channel === null) return null;
        channel.src = audio.url;
        channel.play();
        return channel;
    }
}