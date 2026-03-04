import React from 'react';
import '../App.css';

import ReactPlayer from 'react-player';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clickButton, LoggedOut } from '../store/actions/index';
import axios from 'axios';

// Câmara Pacatuba YouTube Channel
const CHANNEL_ID = 'UCGXhrFTkevDVos5fFyl7HHg';
const API_KEY = 'AIzaSyAvzOdQzU-H_tneJBcbVnmO60dEzWMKhT4';
// Fallback: most recent known session (valid ID from channel)
const FALLBACK_VIDEO_ID = '5bWnirEQwVU';

class Liveatual extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: FALLBACK_VIDEO_ID,
      isLive: false,
      isPlaying: false
    };
  }

  fetchLatestVideo = async () => {
    try {
      // Try to find a current live stream first
      const liveRes = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`
      );
      if (liveRes.data.items && liveRes.data.items.length > 0) {
        this.setState({ videoId: liveRes.data.items[0].id.videoId, isLive: true });
        return;
      }
    } catch (err) {
      console.warn('Live check failed, trying recent video:', err.message);
    }
    try {
      // Fall back to most recent video
      const recentRes = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=1&key=${API_KEY}`
      );
      if (recentRes.data.items && recentRes.data.items.length > 0) {
        this.setState({ videoId: recentRes.data.items[0].id.videoId, isLive: false });
      }
    } catch (error) {
      console.warn('Using fallback video:', error.message);
      // Keep FALLBACK_VIDEO_ID already in state
    }
  };

  componentDidMount() {
    this.fetchLatestVideo();
  }

  render() {
    const { videoId, isLive, isPlaying } = this.state;
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <div className="hero-wrapper">
        <section className={`hero-section ${isPlaying ? 'playing' : ''}`}>
          {!isPlaying ? (
            <div
              className="hero-teaser"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${thumbnail})` }}
            >
              <div className="hero-content">
                <div className="divTitleSectionLive-hero">
                  <h1 className="titleLive-hero">Tv Câmara Pacatuba</h1>
                  {isLive ? (
                    <div className="live-badge">
                      <div className="circleLive-hero"></div>
                      <p className="msgLive-hero">Ao Vivo Agora</p>
                    </div>
                  ) : (
                    <p className="msgLive-hero">Última Transmissão</p>
                  )}
                </div>
                <button className="btn-watch-now" onClick={() => this.setState({ isPlaying: true })}>
                  <span className="icon-play">▶</span> Assistir Agora
                </button>
              </div>
            </div>
          ) : (
            <div className="video-player-container">
              <ReactPlayer
                className="watchVideo"
                url={`https://www.youtube.com/watch?v=${videoId}`}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
              />
              <button className="btn-close-player" onClick={() => this.setState({ isPlaying: false })}>
                ✕ Fechar
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ clickButton, LoggedOut }, dispatch);
}

export default connect(null, mapDispatchToProps)(Liveatual);
