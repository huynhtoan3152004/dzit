import { useEffect, useState } from "react";
import "./App.css";
import Player from "./components/player/Player";
import AllSongs from "./components/AllSongs";
import HappyBirthday from "./components/HappyBirthday";
import { useRecoilState } from "recoil";
import { PlayerState } from "./recoil/atoms/PlayerState";
import { generateRandomIndex } from "./utils/songs";
import { ISongsState, SongsState } from "./recoil/atoms/SongsState";
import { defaultSongs } from "./constants/songs";
import Overlay from "./components/Overlay";

declare global {
  interface Window {
    YT: any;
    player: any;
  }
}

function App() {
  const [playerData, setPlayerData] = useRecoilState(PlayerState);
  const [player, setPlayer] = useState<any>();
  const [isBirthdayVisible, setBirthdayVisible] = useState(false);
  const [songState, setSongsData] = useRecoilState(SongsState);
  const isSpotify = playerData.activeSong?.includes("open.spotify.com");
  const songItem = songState.songs?.find(
    (song) => song.id === playerData.activeSong
  );

  function onPlayerStateChange(event: any) {
    let songsData: ISongsState;
    setSongsData((prev) => {
      songsData = prev;
      return prev;
    });

    setPlayerData((prev) => {
      switch (event.data) {
        case 0:
          if (songsData.songs.length > 1) {
            let index = generateRandomIndex(songsData.songs.length - 1);
            let song = songsData.songs[index];
            const activeSongIndex = songsData.songs.findIndex(
              (song: any) => song.id === playerData.activeSong
            );
            while (index === activeSongIndex) {
              index = generateRandomIndex(songsData.songs.length - 1);
              song = songsData.songs[index];
            }
            return {
              ...prev,
              activeSong: songsData.songs[index].id || defaultSongs[0],
              isBuffering: false,
            };
          }
          return {
            ...prev,
            isBuffering: false,
          };

        case 1:
          return {
            ...prev,
            isPlaying: true,
            isBuffering: false,
          };

        case 2:
          return {
            ...prev,
            isPlaying: false,
            isBuffering: false,
          };

        case 3:
        case -1:
          return {
            ...prev,
            isBuffering: true,
          };

        default:
          return {
            ...prev,
            isBuffering: false,
          };
      }
    });
  }

  const handleLoadCapture = () => {
    new window.YT.Player("yt-iframe", {
      events: {
        onStateChange: onPlayerStateChange,
        onReady: function (event: any) {
          const data = {
            playerInfo: {
              videoData: event.target.getVideoData(),
              videoUrl: event.target.getVideoUrl(),
            },
            playVideo() {
              event.target.playVideo();
            },
            pauseVideo() {
              event.target.pauseVideo();
            },
            setVolume(...args: any) {
              event.target.setVolume(...args);
            },
            seekTo(...args: any) {
              event.target.seekTo(...args);
            },
            getCurrentTime() {
              return event.target.getCurrentTime();
            },
            getDuration() {
              return event.target.getDuration();
            },
          };
          event.target.playVideo();
          setPlayer(data);
        },
      },
      playerVars: { autoplay: 1, controls: 0 },
    });
  };

  const toggleBirthday = () => {
    setBirthdayVisible((prev) => !prev);
  };

  return (
    <div className="App" unselectable="on">
      <div className="iframe-container" unselectable="on">
        {!isSpotify && (
          <iframe
            key={playerData.activeSong}
            src={`https://www.youtube.com/embed/${playerData.activeSong}?enablejsapi=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            id="yt-iframe"
            unselectable="on"
            onSelect={() => false}
            onMouseDown={() => false}
            onLoad={handleLoadCapture}
            style={
              playerData.scalingDisabled
                ? {
                    transform: "scale(1)",
                  }
                : {}
            }
          />
        )}
      </div>

      <div
        style={{
          backgroundImage: `url(${playerData.bgImgUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
        className="player-content"
      >
        {playerData.showSongsList && (
          <AllSongs
            onSongClick={(songId) => {
              setPlayerData((prev) => ({
                ...prev,
                activeSong: songId,
              }));
              window.localStorage.setItem("activeSong", songId);
            }}
            activeSongId={playerData.activeSong}
            onClose={() =>
              setPlayerData((prev) => ({
                ...prev,
                showSongsList: false,
              }))
            }
          />
        )}

        <div className="text">
          {!playerData.isPlaying &&
            player &&
            "Tap to start playing the music 📻"}
          {playerData.isPlaying && playerData.isBuffering && "Buffering.. ⏳"}
        </div>

        <Player player={player} onBirthdayClick={toggleBirthday} />
      </div>

      <Overlay showAlways={isSpotify} player={player} />
      {isBirthdayVisible && (
        <HappyBirthday
          onClose={() => {
            setBirthdayVisible(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
