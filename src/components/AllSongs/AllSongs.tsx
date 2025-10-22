import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { SongsState, ISong } from "../../recoil/atoms/SongsState";
import { getSongs, getStarredSongs, saveSongs, saveStarredSongs } from "../../utils/songs";
import { defaultSongs } from "../../constants/songs";
import Header from "./Header";
import Songs from "./Songs";
import "./all-songs-style.css";

type AllSongsProps = {
  onClose: () => void;
  onSongClick: (songId: string) => void;
  activeSongId?: string;
};

type HeaderOptionType = "starred" | "allsongs" | "addsong";

function AllSongs({ onClose, onSongClick, activeSongId }: AllSongsProps) {
  const [songsState, setSongsState] = useRecoilState(SongsState);
  const [activeOption, setActiveOption] = useState<HeaderOptionType>("allsongs");
  const [newSongId, setNewSongId] = useState("");
  const [addingSong, setAddingSong] = useState(false);

  // Load songs khi component mount
  useEffect(() => {
    const loadSongs = async () => {
      try {
        console.log("Loading songs...");
        
        const songs = getSongs();
        const starred = getStarredSongs();

        console.log("Loaded songs:", songs);
        console.log("Starred songs:", starred);

        setSongsState({
          songs,
          starredSongs: starred,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading songs:", error);
        setSongsState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadSongs();
  }, []);

  const handleAddSong = async () => {
    if (!newSongId.trim()) return;

    setAddingSong(true);
    try {
      // Extract YouTube ID từ URL hoặc ID
      let videoId = newSongId.trim();
      const urlMatch = newSongId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }

      // Check if already exists
      if (songsState.songs.some((s) => s.id === videoId)) {
        alert("This song is already in your list!");
        setAddingSong(false);
        return;
      }

      const newSong: ISong = {
        id: videoId,
        title: `Video ${videoId}`,
        thumbnails: {
          default: {
            url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
          },
        },
        channelTitle: "YouTube",
        starred: false,
        addedOn: new Date().toISOString(),
      };

      const updatedSongs = [...songsState.songs, newSong];
      
      // Save only user-added songs (not default ones)
      const customSongs = updatedSongs.filter((s) => !defaultSongs.includes(s.id));
      saveSongs(customSongs);

      setSongsState({
        ...songsState,
        songs: updatedSongs,
      });

      setNewSongId("");
      setActiveOption("allsongs");
    } catch (error) {
      console.error("Error adding song:", error);
      alert("Failed to add song. Please check the video ID.");
    } finally {
      setAddingSong(false);
    }
  };

  const handleToggleStar = (songId: string) => {
    const isStarred = songsState.starredSongs.includes(songId);
    const updatedStarred = isStarred
      ? songsState.starredSongs.filter((id) => id !== songId)
      : [...songsState.starredSongs, songId];

    saveStarredSongs(updatedStarred);
    setSongsState({
      ...songsState,
      starredSongs: updatedStarred,
    });
  };

  const handleRemoveSong = (songId: string) => {
    // Không cho xóa default songs
    if (defaultSongs.includes(songId)) {
      alert("Cannot remove default songs!");
      return;
    }

    const updatedSongs = songsState.songs.filter((s) => s.id !== songId);
    const updatedStarred = songsState.starredSongs.filter((id) => id !== songId);

    // Save only user-added songs (not default ones)
    const customSongs = updatedSongs.filter((s) => !defaultSongs.includes(s.id));
    saveSongs(customSongs);
    saveStarredSongs(updatedStarred);

    setSongsState({
      songs: updatedSongs,
      starredSongs: updatedStarred,
      isLoading: false,
    });
  };

  // Render loading
  if (songsState.isLoading) {
    return (
      <div className="all-songs-container">
        <div className="all-songs">
          <Header
            activeOption={activeOption}
            setActiveOption={setActiveOption}
            onClose={onClose}
          />
          <div className="content loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading songs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displaySongs =
    activeOption === "starred"
      ? songsState.songs.filter((s) => songsState.starredSongs.includes(s.id))
      : songsState.songs;

  return (
    <div className="all-songs-container">
      <div className="all-songs">
        <Header
          activeOption={activeOption}
          setActiveOption={setActiveOption}
          onClose={onClose}
        />
        <div className="content">
          {activeOption === "addsong" ? (
            <div className="add-song-form">
              <h3>Add YouTube Video</h3>
              <input
                type="text"
                placeholder="Paste YouTube URL or Video ID"
                value={newSongId}
                onChange={(e) => setNewSongId(e.target.value)}
                disabled={addingSong}
              />
              <button onClick={handleAddSong} disabled={addingSong || !newSongId.trim()}>
                {addingSong ? "Adding..." : "Add Song"}
              </button>
            </div>
          ) : (
            <Songs
              songs={displaySongs}
              starred={songsState.starredSongs}
              onSongClick={onSongClick}
              activeSongId={activeSongId}
              addOrRemoveStar={(songId, isAdding) => {
                handleToggleStar(songId);
              }}
              onRemoveSong={handleRemoveSong}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AllSongs;
