import React, { Component } from 'react';
import ReactPlayer from 'react-player'

import axios from 'axios'
import { connect } from 'react-redux'

// Componetes
import ClassPlayer from '../../components/classPlayer'
import MainMenu from '../../components/mainMenu'




import Footer from '../../components/footer'
import '../../App.css'

const API_KEY = 'AIzaSyAvzOdQzU-H_tneJBcbVnmO60dEzWMKhT4';



// function onClickHandler(){
//     // const data = new FormData() 
//     // data.append('file', this.state.selectedFile)
//     console.log('Botão funciona')
//     console.log(this.state.id)

// }

// function goFilter(){
//     window.location.href = "/listItems"
//   }

class Gestao extends Component {
  constructor(props) {
    super(props)
    this.state = {
      idAula: this.props.idAula,
      idCouse: this.props.idCourse,
      tipo: this.props.tipoItem,
      userType: this.props.tipo,
      title: '',
      description: '',
      data: '',
      teacher: 'Professor',
      uriVideo: ``,
      avisos: '',
      videos: ''
    }
  }


  loadAula = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${this.props.idAula}&key=${API_KEY}`
      );

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        this.setState({
          title: video.snippet.title,
          description: video.snippet.description,
          dataPublic: video.snippet.publishedAt,
        });
      }
    } catch (err) {
      console.error('Error loading video details:', err);
    }
  }

  componentDidMount() {
    // this.providerGoogle = new firebase.auth.GoogleAuthProvider();
    // if (this.props.userId === '') {
    //   window.location.href = "/login"
    // }
    const loadPage = () => this.loadAula()
    loadPage()
  }



  render() {
    return (
      <div className="player-page-wrapper">
        <MainMenu />

        <main className="player-main-content">
          <div className="player-container-premium">
            <div className="video-wrapper-cinematic">
              <ReactPlayer
                className="react-player-cinematic"
                url={`https://www.youtube.com/watch?v=${this.props.idAula}`}
                controls={true}
                width="100%"
                height="100%"
                playing={true}
              />
            </div>
          </div>

          <div className="video-details-container">
            <div className="video-info-header">
              <h1 className="video-title-premium">{this.state.title}</h1>
              <div className="video-meta-premium">
                <span className="publish-date">
                  {this.state.dataPublic ? new Date(this.state.dataPublic).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : ''}
                </span>
              </div>
            </div>
            <div className="video-description-premium">
              <p>{this.state.description}</p>
            </div>
          </div>

          <section className="more-videos-section">
            <div className="container-modern">
              <h2 className="section-title-modern">Mais Sessões e Transmissões</h2>
              <div className="related-videos-grid">
                <ClassPlayer />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    id: store.course.id,
    idAula: store.course.idAula,
    idCourse: store.course.idCurso,
    tipoAula: store.course.tipoAula,
    tipoItem: store.course.tipo,
    userId: store.user.userId,
  }
};

export default connect(mapStateToProps)(Gestao)