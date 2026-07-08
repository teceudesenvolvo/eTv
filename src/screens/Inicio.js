import React, { Component } from 'react';
import '../App.css';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openAula } from '../store/actions/index';

import MainMenu from '../components/mainMenu';
import Footer from '../components/footer';
import { fetchPlaylistItems, startPlaylistPolling, refreshPlaylistFromChannel } from '../services/youtubeService';
import { fetchSessoes, fetchMaterias, materiasForSession } from '../services/cmpacatubaService';

class Inicio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      featured: null,
      loading: true,
      error: null,
      searchTerm: '',
      sessions: [],
      materias: [],
      sessionError: null,
    };
  }

  componentDidMount() {
    this.playlistCleanup = startPlaylistPolling(this.updatePlaylist, 60000);
    this.loadSessionData();
  }

  componentWillUnmount() {
    if (this.playlistCleanup) {
      this.playlistCleanup();
    }
  }

  updatePlaylist = async () => {
    try {
      const items = await fetchPlaylistItems();
      if (!items || items.length === 0) {
        this.setState({ loading: false, error: 'Nenhum vídeo encontrado na playlist.' });
        return;
      }

      const videos = items.map(item => ({
        videoId: item.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail:
          item.snippet.thumbnails.maxres?.url ||
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
      }));

      this.setState({
        videos,
        featured: videos[0],
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Erro ao atualizar playlist:', err);
      this.setState({ loading: false, error: 'Falha ao carregar playlist. Tente novamente em um instante.' });
    }
  };

  loadSessionData = async () => {
    try {
      const [sessions, materias] = await Promise.all([fetchSessoes(), fetchMaterias()]);
      this.setState({
        sessions,
        materias,
        sessionError: null,
      });
    } catch (err) {
      console.error('Erro ao carregar dados de sessões:', err);
      this.setState({ sessionError: 'Falha ao carregar informações de sessão.' });
    }
  };

  playVideo = video => {
    this.props.openAula({ idAula: video.videoId, tipo: 'class' });
    window.location.href = '/player';
  };

  refreshPlaylist = async () => {
    // manual refresh: uses the more expensive search endpoint under the hood,
    // which is intended to be called sparingly
    try {
      const items = await refreshPlaylistFromChannel();
      if (!items || items.length === 0) {
        this.setState({ loading: false, error: 'Nenhum vídeo encontrado na playlist.' });
        return;
      }

      const videos = items.map(item => ({
        videoId: item.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.publishedAt,
        thumbnail:
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.default?.url ||
          '',
      }));

      this.setState({
        videos,
        featured: videos[0],
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Erro ao atualizar playlist (refresh):', err);
      this.setState({ loading: false, error: 'Falha ao atualizar playlist.' });
    }
  };

  render() {
    const { featured, videos, loading, error, searchTerm, sessionError } = this.state;
    const filteredVideos = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="streaming-home-page">
        <MainMenu />

        <section className="home-hero-section">
          <div
            className="home-hero-bg"
            style={{
              backgroundImage: featured
                ? `linear-gradient(180deg, rgba(8,12,20,0.15), rgba(8,12,20,0.95)), url(${featured.thumbnail})`
                : 'linear-gradient(180deg, rgba(8,12,20,0.95), rgba(8,12,20,0.95))',
            }}
          >
            <div className="home-hero-copy">
              <span className="hero-badge">Streaming sem login</span>
              <h1>{featured ? featured.title : 'Carregando o canal...'}</h1>
              <p>{featured ? featured.description : 'Veja a playlist mais recente carregada automaticamente.'}</p>
              <div className="hero-cta-group">
                <button className="btn-primary-hero" onClick={() => featured && this.playVideo(featured)}>
                  Assistir agora
                </button>
                <button className="btn-secondary-hero" onClick={this.refreshPlaylist}>
                  Atualizar lista
                </button>
              </div>
              {/* hero meta removed per design: no update notice */}
            </div>
          </div>
        </section>

        {this.state.sessions.length > 0 && !sessionError && (
          <section className="session-info-row">
            <div className="container-modern">
              <div className="section-header-row">
                <div>
                  <h2>Informações da sessão</h2>
                  <p>Dados oficiais das sessões e matérias conforme a API da Câmara.</p>
                </div>
              </div>

              <div className="session-card-grid">
                {this.state.sessions.slice(0, 2).map(session => (
                  <article key={session.Id} className="session-card-modern">
                    <div className="session-card-body">
                      <span className="session-type">{session.Tipo}</span>
                      <h3>{`Sessão ${session.Numero}`}</h3>
                      <p>{new Date(session.Data).toLocaleDateString('pt-BR')}</p>
                      <p>{session.Expediente || 'Sem expediente cadastrado'}</p>
                      <a href={session.Url} target="_blank" rel="noopener noreferrer">Ver sessão</a>
                    </div>
                  </article>
                ))}
              </div>

              {this.state.sessions.length > 0 && (
                <div className="materias-list-row">
                  <h3>Matérias da última sessão</h3>
                  {materiasForSession(this.state.sessions[0], this.state.materias).length > 0 ? (
                    <ul className="materias-list">
                      {materiasForSession(this.state.sessions[0], this.state.materias).map(materia => (
                        <li key={materia.Id} className="materia-item">
                          <a href={materia.Url} target="_blank" rel="noopener noreferrer">
                            {`${materia.Tipo} ${materia.Numero}/${materia.Exercicio}`}
                          </a>
                          <p>{materia.Ementa}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhuma matéria encontrada para esta sessão.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="home-search-row">
          <div className="container-modern">
            <div className="section-header-row">
              <div>
                <h2>Explorar conteúdo</h2>
                <p>Busque sessões, eventos e transmissões recentes.</p>
              </div>
              <input
                type="search"
                placeholder="Pesquisar vídeos..."
                value={searchTerm}
                onChange={event => this.setState({ searchTerm: event.target.value })}
              />
            </div>

            {loading && <div className="home-loading">Carregando playlist...</div>}
            {error && <div className="home-error">{error}</div>}

            <div className="video-grid-modern">
              {filteredVideos.slice(0, 12).map(video => (
                <article className="video-card-modern" key={video.videoId} onClick={() => this.playVideo(video)}>
                  <div className="card-thumb-container">
                    <img src={video.thumbnail} alt={video.title} loading="lazy" />
                    <div className="play-overlay">▶</div>
                  </div>
                  <div className="card-content-modern">
                    <h3>{video.title}</h3>
                    <p>{new Date(video.publishedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </article>
              ))}
            </div>

            {filteredVideos.length === 0 && !loading && (
              <div className="home-no-results">
                Nenhum vídeo encontrado para <strong>{searchTerm}</strong>.
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ openAula }, dispatch);
};

export default connect(null, mapDispatchToProps)(Inicio);
