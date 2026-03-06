import React, { Component } from 'react';

import axios from 'axios'

import { connect } from 'react-redux';
import { openAula, clickButton, LoggedOut } from '../../store/actions/index';
import { bindActionCreators } from 'redux';

import MainMenu from '../../components/mainMenu'
import Footer from '../../components/footer'

import '../../App.css'

import { FaSearch, FaPlay } from 'react-icons/fa';

const API_KEY = 'AIzaSyAvzOdQzU-H_tneJBcbVnmO60dEzWMKhT4';
const CHANNEL_ID = 'UCGXhrFTkevDVos5fFyl7HHg';

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

    }
  }

  loadAvisos = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=12&order=date&type=video&key=${API_KEY}`
      );
      const videoItems = response.data.items;

      const filteredVideos = videoItems.filter(video =>
        video.snippet.title.toUpperCase().includes(this.state.searchCourse.toUpperCase())
      );

      this.setState({ avisos: filteredVideos });
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  }

  // pesquisar aula



  componentDidMount() {



    const loadPage = () => this.loadAvisos()
    loadPage()
  }


  render() {

    // Carregar Aulas
    const avisos = this.state.avisos

    const listAvisos = avisos.map((aviso) => (
      <div className="video-card-modern" key={aviso.id.videoId}
        onClick={() => {
          this.setState({ idAula: aviso.id.videoId, tipo: 'class' }, () => {
            this.props.openAula(this.state);
            window.location.href = "/player";
          });
        }}
      >
        <div className="card-thumb-container">
          <img src={aviso.snippet.thumbnails.high.url} alt={aviso.snippet.title} />
          <div className="play-overlay">
            <FaPlay />
          </div>
        </div>
        <div className="card-content-modern">
          <h3 className="card-title-modern">{aviso.snippet.title}</h3>
          <p className="card-date-modern">
            {new Date(aviso.snippet.publishedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    ))

    return (
      <div className="search-page-wrapper">
        <MainMenu />
        <div className="search-hero-modern">
          <div className="search-container-modern">
            <FaSearch className="search-icon-modern" />
            <input
              type="text"
              className="search-input-modern"
              placeholder="Pesquisar transmissões, sessões ou eventos..."
              value={this.state.searchCourse}
              onChange={(event) => {
                this.setState({ searchCourse: event.target.value }, () => {
                  this.loadAvisos();
                });
              }}
            />
          </div>
        </div>

        <main className="search-results-area">
          <div className="container-modern">
            <h2 className="section-title-modern">Resultados da Busca</h2>
            <div className="video-grid-modern">
              {listAvisos}
            </div>
            {avisos.length === 0 && (
              <div className="no-results-modern">
                <p>Nenhum conteúdo encontrado para "{this.state.searchCourse}"</p>
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