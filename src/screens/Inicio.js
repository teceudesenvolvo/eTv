import React, { Component } from 'react';
import '../App.css';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openAula } from '../store/actions/index';

import MainMenu from '../components/mainMenu';
import Footer from '../components/footer';
import { fetchPlaylistItems, startPlaylistPolling } from '../services/youtubeService';
import { fetchMaterias, fetchVereadores, fetchNoticias } from '../services/cmpacatubaService';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';

class Inicio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      featured: null,
      loading: true,
      error: null,
      searchTerm: '',
      materias: [],
      vereadores: [],
      noticias: [],
      civicError: null,
      activeModal: null,
    };
  }

  componentDidMount() {
    this.playlistCleanup = startPlaylistPolling(this.updatePlaylist, 60000);
    this.loadSessionData();
    this.loadCivicData();
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
      const materias = await fetchMaterias();
      this.setState({
        materias,
        civicError: null,
      });
    } catch (err) {
      console.error('Erro ao carregar matérias:', err);
      this.setState({ civicError: 'Falha ao carregar dados públicos da Câmara.' });
    }
  };

  loadCivicData = async () => {
    try {
      const [vereadores, noticias] = await Promise.all([fetchVereadores(), fetchNoticias()]);
      this.setState({
        vereadores,
        noticias,
        civicError: null,
      });
    } catch (err) {
      console.error('Erro ao carregar vereadores/notícias:', err);
      this.setState({ civicError: 'Falha ao carregar dados públicos da Câmara.' });
    }
  };

  playVideo = video => {
    this.props.openAula({ idAula: video.videoId, tipo: 'class' });
    window.location.href = '/player';
  };

  getImageUrl = item => {
    if (!item) return '';
    const image =
      item.Foto ||
      item.Imagem ||
      item.ImagemCapa ||
      item.Capa ||
      item.CapaURL ||
      item.Thumb ||
      item.UrlImagem ||
      item.foto ||
      item.imagem ||
      '';

    if (!image || String(image).startsWith('http')) return image;
    return `https://www.cmpacatuba.ce.gov.br/${String(image).replace(/^\/+/, '')}`;
  };

  getNewsTitle = noticia => {
    return noticia.Titulo || noticia.Nome || noticia.Chamada || noticia.Descricao || 'Notícia da Câmara';
  };

  getNewsSummary = noticia => {
    const rawSummary = noticia.Subtitulo || noticia.Resumo || noticia.Descricao || noticia.Texto || '';
    return String(rawSummary).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };

  openNewsModal = noticia => {
    this.setState({
      activeModal: {
        kicker: noticia.Categoria || 'Notícia',
        title: this.getNewsTitle(noticia),
        date: this.formatDate(noticia.Data || noticia.DataCadastro),
        body: this.getNewsSummary(noticia) || 'Sem descrição cadastrada para esta notícia.',
        url: noticia.Url,
      },
    });
  };

  getMateriaTitle = materia => {
    const tipo = materia.Tipo || materia.Especie || 'Matéria';
    const numero = materia.Numero ? ` ${materia.Numero}` : '';
    const exercicio = materia.Exercicio ? `/${materia.Exercicio}` : '';
    return `${tipo}${numero}${exercicio}`.trim();
  };

  getMateriaSummary = materia => {
    const rawSummary = materia.Ementa || materia.Descricao || materia.Assunto || materia.Texto || '';
    return String(rawSummary).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };

  openMateriaModal = materia => {
    this.setState({
      activeModal: {
        kicker: materia.Tipo || 'Matéria legislativa',
        title: this.getMateriaTitle(materia),
        date: this.formatDate(materia.Data || materia.DataCadastro),
        body: this.getMateriaSummary(materia) || 'Sem ementa cadastrada para esta matéria.',
        url: materia.Url,
      },
    });
  };

  closeModal = () => {
    this.setState({ activeModal: null });
  };

  formatDate = date => {
    if (!date) return '';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);
    return parsedDate.toLocaleDateString('pt-BR');
  };

  render() {
    const { featured, videos, loading, error, searchTerm, materias, vereadores, noticias, civicError, activeModal } = this.state;
    const filteredVideos = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const carouselOptions = {
      type: 'loop',
      perMove: 1,
      gap: '22px',
      autoplay: true,
      interval: 4200,
      pauseOnHover: true,
      arrows: true,
      pagination: true,
      breakpoints: {
        1200: { perPage: 3 },
        768: { perPage: 2 },
        560: { perPage: 1 },
      },
    };
    const vereadorOptions = {
      ...carouselOptions,
      perPage: 5,
      breakpoints: {
        1200: { perPage: 4 },
        900: { perPage: 3 },
        640: { perPage: 2 },
        420: { perPage: 1 },
      },
    };
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
              </div>
              {/* hero meta removed per design: no update notice */}
            </div>
          </div>
        </section>

        <section className="civic-glass-section vereadores-home-section">
          <div className="container-modern">
            <div className="section-header-row glass-section-header">
              <div>
                <span className="section-kicker">Legislativo</span>
                <h2>Vereadores</h2>
                <p>Parlamentares da Câmara Municipal de Pacatuba.</p>
              </div>
            </div>

            {civicError && <div className="home-error">{civicError}</div>}
            {vereadores.length > 0 && (
              <Splide options={vereadorOptions} className="glass-carousel vereadores-home-carousel">
                {vereadores.map(vereador => (
                  <SplideSlide key={vereador.Id || vereador.NomeParlamentar || vereador.Nome}>
                    <article
                      className="glass-person-card"
                      onClick={() => vereador.Url && window.open(vereador.Url, '_blank')}
                    >
                      <div className="glass-person-photo">
                        <img src={this.getImageUrl(vereador)} alt={vereador.NomeParlamentar || vereador.Nome} loading="lazy" />
                      </div>
                      <div className="glass-person-info">
                        <h3>{vereador.NomeParlamentar || vereador.Nome}</h3>
                        <p>{vereador.Cargo || 'Vereador(a)'}</p>
                        <span>{vereador.Partido || vereador.SiglaPartido || ''}</span>
                      </div>
                    </article>
                  </SplideSlide>
                ))}
              </Splide>
            )}
          </div>
        </section>

        <section className="civic-glass-section news-home-section">
          <div className="container-modern">
            <div className="section-header-row glass-section-header">
              <div>
                <span className="section-kicker">Acontece na Câmara</span>
                <h2>Notícias</h2>
                <p>Atualizações oficiais em destaque.</p>
              </div>
            </div>

            {noticias.length > 0 && (
              <div className="news-card-grid">
                {noticias.slice(0, 4).map(noticia => (
                  <article className="glass-news-card" key={noticia.Id || this.getNewsTitle(noticia)}>
                    <div className="glass-news-image">
                      {this.getImageUrl(noticia) ? (
                        <img src={this.getImageUrl(noticia)} alt={this.getNewsTitle(noticia)} loading="lazy" />
                      ) : (
                        <div className="news-image-placeholder">CM</div>
                      )}
                    </div>
                    <div className="glass-news-content">
                      <span>{this.formatDate(noticia.Data || noticia.DataCadastro)}</span>
                      <h3>{this.getNewsTitle(noticia)}</h3>
                      <p>{this.getNewsSummary(noticia) || 'Sem descrição cadastrada.'}</p>
                      <button type="button" className="news-read-button" onClick={() => this.openNewsModal(noticia)}>
                        Ler notícia
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {materias.length > 0 && (
          <section className="civic-glass-section materias-home-section">
            <div className="container-modern">
              <div className="section-header-row glass-section-header">
                <div>
                  <span className="section-kicker">Legislativo em pauta</span>
                  <h2>Matérias recentes</h2>
                  <p>Proposições e documentos oficiais organizados para leitura rápida.</p>
                </div>
              </div>

              <div className="matter-grid-modern">
                {materias.slice(0, 8).map(materia => (
                  <article key={materia.Id || `${materia.Numero}-${materia.Exercicio}`} className="matter-card-modern">
                    <span className="matter-card-kicker">{materia.Tipo || 'Matéria'}</span>
                    <h3>{this.getMateriaTitle(materia)}</h3>
                    <p>{this.getMateriaSummary(materia) || 'Sem ementa cadastrada.'}</p>
                    <div className="matter-card-footer">
                      <span>{this.formatDate(materia.Data || materia.DataCadastro)}</span>
                      <button type="button" onClick={() => this.openMateriaModal(materia)}>
                        Ler ementa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
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
                {searchTerm
                  ? `Nenhum vídeo encontrado para ${searchTerm}.`
                  : 'Nenhum vídeo encontrado.'}
              </div>
            )}
          </div>
        </section>

        <Footer />

        {activeModal && (
          <div className="content-modal-overlay" role="presentation" onClick={this.closeModal}>
            <div className="content-modal-card" role="dialog" aria-modal="true" aria-labelledby="content-modal-title" onClick={event => event.stopPropagation()}>
              <button type="button" className="content-modal-close" aria-label="Fechar" onClick={this.closeModal}>
                ×
              </button>
              <span className="content-modal-kicker">{activeModal.kicker}</span>
              <h2 id="content-modal-title">{activeModal.title}</h2>
              {activeModal.date && <time>{activeModal.date}</time>}
              <p>{activeModal.body}</p>
              {activeModal.url && (
                <a href={activeModal.url} target="_blank" rel="noopener noreferrer">
                  Abrir no portal
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ openAula }, dispatch);
};

export default connect(null, mapDispatchToProps)(Inicio);
