import { atom } from "recoil";

export interface ISong {
  id: string;
  title?: string;
  thumbnails?: {
    default: {
      url: string;
    };
  };
  url?: string;
  iframeUrl?: string;
  channelTitle?: string;
  starred?: boolean;
  addedOn?: string;
  liveBroadcastContent?: string;
}

export interface ISongsState {
  songs: ISong[];
  starredSongs: string[];
  isLoading: boolean;
}

export const SongsState = atom<ISongsState>({
  key: "SongsState",
  default: {
    songs: [],
    starredSongs: [],
    isLoading: true,
  },
});
