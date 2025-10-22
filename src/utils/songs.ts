import { ISong } from "../recoil/atoms/SongsState";
import { defaultSongs } from "../constants/songs";

export const getSongs = (): ISong[] => {
  try {
    const addedSongsData = localStorage.getItem("addedSongs");
    const addedSongs: ISong[] = addedSongsData ? JSON.parse(addedSongsData) : [];

    // Tạo songs từ default list
    const defaultSongsList: ISong[] = defaultSongs.map((id) => ({
      id,
      title: `Video ${id}`,
      thumbnails: {
        default: {
          url: `https://img.youtube.com/vi/${id}/default.jpg`,
        },
      },
      channelTitle: "YouTube",
      starred: false,
      addedOn: new Date().toISOString(),
    }));

    // Merge
    const existingIds = new Set(addedSongs.map((s) => s.id));
    const uniqueDefaults = defaultSongsList.filter((s) => !existingIds.has(s.id));
    
    return [...addedSongs, ...uniqueDefaults];
  } catch (error) {
    console.error("Error loading songs:", error);
    return [];
  }
};

// Alias cho compatibility với Player.tsx
export const getAllSongs = (): string[] => {
  const songs = getSongs();
  return songs.map((s) => s.id);
};

export const getStarredSongs = (): string[] => {
  try {
    const starredData = localStorage.getItem("starred");
    return starredData ? JSON.parse(starredData) : [];
  } catch (error) {
    console.error("Error loading starred songs:", error);
    return [];
  }
};

export const saveSongs = (songs: ISong[]): void => {
  try {
    // Chỉ lưu custom songs (không phải default)
    const customSongs = songs.filter((s) => !defaultSongs.includes(s.id));
    localStorage.setItem("addedSongs", JSON.stringify(customSongs));
  } catch (error) {
    console.error("Error saving songs:", error);
  }
};

export const saveStarredSongs = (starredIds: string[]): void => {
  try {
    localStorage.setItem("starred", JSON.stringify(starredIds));
  } catch (error) {
    console.error("Error saving starred songs:", error);
  }
};

// Utility functions
export function getVolume() {
  return JSON.parse(window.localStorage.getItem("volume") || "50");
}

export function generateRandomIndex(maxLimit: number = defaultSongs.length - 1) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand);
  return rand;
}
