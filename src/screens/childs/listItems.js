import React, { Component } from 'react';

import { connect } from 'react-redux';
import { openAula, clickButton, LoggedOut } from '../../store/actions/index';
import { bindActionCreators } from 'redux';

import MainMenu from '../../components/mainMenu'
import Footer from '../../components/footer'

import '../../App.css'

import { FaSearch, FaPlay } from 'react-icons/fa';
import { fetchPlaylistItems } from '../../services/youtubeService';

// function onClickHandler(){
//     // const data = new FormData() 
//     // data.append('file', this.state.selectedFile)
//     console.log('Botão funciona')
// }

// function goHome(){
//   window.location.href = "/buscar"
// }

// function content(){
//     window.location.href = "/item"
// }

// function goFilter(){
//     window.location.href = "/listItems"
// }


class ListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: '566',
      tipo: 'aviso',
      avisos: [],
      carregar: 'Carregar Avisos',
      btnLoad: "visitanteBtn",
      searchCourse: '',
      allVideos: [],
      loading: true,
      error: null,

    }
  }

  loadAvisos = async () => {
    try {
      const videoItems = await fetchPlaylistItems({ noCache: true });

      const filteredVideos = videoItems.filter(video =>
        video.snippet.title.toUpperCase().includes(this.state.searchCourse.toUpperCase())
      );

      this.setState({
        avisos: filteredVideos,
        allVideos: videoItems,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching videos:', err);
      this.setState({
        loading: false,
        error: 'Falha ao carregar os vídeos. Tente novamente em instantes.',
      });
    }
  }

  // pesquisar aula



  componentDidMount() {



    const loadPage = () => this.loadAvisos()
    loadPage()
  }


  render() {

    // Carregar Aulas
    const { avisos, loading, error, searchCourse } = this.state

    const listAvisos = avisos.map((aviso) => (
      <div className="video-card-modern" key={aviso.videoId}
        onClick={() => {
          this.setState({ idAula: aviso.videoId, tipo: 'class' }, () => {
            this.props.openAula(this.state);
            window.location.href = "/player";
          });
        }}
      >
        <div className="card-thumb-container">
          <img
            src={
              aviso.snippet.thumbnails?.maxres?.url ||
              aviso.snippet.thumbnails?.high?.url ||
              aviso.snippet.thumbnails?.default?.url ||
              ''
            }
            alt={aviso.snippet.title}
          />
          <div className="play-overlay">
            <FaPlay />
          </div>
        </div>
        <div className="card-content-modern">
          <h3 className="card-title-modern">{aviso.snippet.title}</h3>
          <p className="card-date-modern">
            {new Date(aviso.publishedAt || aviso.snippet.publishedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    ))

    return (
      <div className="search-page-wrapper">
        <MainMenu />
        <section className="search-hero-modern">
          <div className="search-container-modern">
            <div className="search-copy-modern">
              <span className="section-kicker">Busca</span>
              <h1>Encontrar transmissões</h1>
              <p>Pesquise sessões, audiências públicas e conteúdos recentes da TV Câmara.</p>
            </div>
            <label className="search-field-modern">
              <FaSearch className="search-icon-modern" />
              <input
                type="search"
                className="search-input-modern"
                placeholder="Pesquisar por título..."
                value={searchCourse}
                onChange={(event) => {
                  const value = event.target.value;
                  this.setState({
                    searchCourse: value,
                    avisos: this.state.allVideos.filter(video =>
                      video.snippet.title.toUpperCase().includes(value.toUpperCase())
                    ),
                  });
                }}
              />
            </label>
          </div>
        </section>

        <main className="search-results-area">
          <div className="container-modern">
            <div className="section-header-row search-results-header">
              <div>
                <h2>Resultados</h2>
                <p>{loading ? 'Carregando vídeos...' : `${avisos.length} conteúdo(s) encontrado(s).`}</p>
              </div>
            </div>
            {error && <div className="home-error">{error}</div>}
            <div className="video-grid-modern">
              {listAvisos}
            </div>
            {avisos.length === 0 && !loading && (
              <div className="no-results-modern">
                <p>{searchCourse ? `Nenhum conteúdo encontrado para "${searchCourse}"` : 'Nenhum conteúdo encontrado.'}</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({ openAula, clickButton, LoggedOut }, dispatch);
}

export default connect(null, mapDispatchToProps)(ListItem);
