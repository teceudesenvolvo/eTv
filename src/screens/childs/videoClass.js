import React, { Component } from 'react';
import ReactPlayer from 'react-player'

import axios from 'axios'
import { connect } from 'react-redux'

// Componetes
import ClassPlayer from '../../components/classPlayer'
import MainMenu from '../../components/mainMenu'




import Footer from '../../components/footer'
import '../../App.css'
import { fetchSessoes, fetchMaterias, materiasForSession } from '../../services/cmpacatubaService'

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || null;



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
      dataPublic: '',
      teacher: 'Professor',
      uriVideo: ``,
      avisos: '',
      videos: '',
      session: null,
      materias: [],
      sessionLoading: true,
      sessionError: null,
    }
  }

  formatDate = date => {
    if (!date) return 'Não informado';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getSessionTitle = () => {
    const { session } = this.state;
    if (!session) return 'Sessão não vinculada';
    const type = session.Tipo || 'Sessão';
    const number = session.Numero ? ` ${session.Numero}` : '';
    return `${type}${number}`;
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
    const loadPage = () => {
      this.loadAula()
      this.loadSessionData()
    }
    loadPage()
  }

  loadSessionData = async () => {
    try {
      const [sessions, materias] = await Promise.all([fetchSessoes(), fetchMaterias()]);
      this.setState({
        session: sessions[0] || null,
        materias: materiasForSession(sessions[0] || null, materias),
        sessionLoading: false,
        sessionError: null,
      });
    } catch (err) {
      console.error('Erro ao carregar informações da sessão:', err);
      this.setState({ sessionLoading: false, sessionError: 'Não foi possível carregar dados da sessão.' });
    }
  }



  render() {
    const {
      title,
      description,
      dataPublic,
      session,
      materias,
      sessionLoading,
      sessionError,
    } = this.state;

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
            <header className="video-info-header">
              <span className="player-kicker">TV Câmara Pacatuba</span>
              <h1 className="video-title-premium">{title || 'Carregando transmissão...'}</h1>
              <div className="video-meta-premium">
                <span className="publish-date">{this.formatDate(dataPublic)}</span>
                <span>{this.getSessionTitle()}</span>
              </div>
            </header>

            <div className="player-data-grid">
              <section className="player-data-section video-description-premium">
                <span className="player-section-label">Resumo do vídeo</span>
                <p>{description || 'Descrição não disponível para este vídeo.'}</p>
              </section>

              <section className="player-data-section">
                <span className="player-section-label">Informações</span>
                <dl className="player-facts-list">
                  <div>
                    <dt>Publicado em</dt>
                    <dd>{this.formatDate(dataPublic)}</dd>
                  </div>
                  <div>
                    <dt>Fonte</dt>
                    <dd>Canal oficial da Câmara Municipal</dd>
                  </div>
                  <div>
                    <dt>Registro legislativo</dt>
                    <dd>{sessionLoading ? 'Carregando...' : this.getSessionTitle()}</dd>
                  </div>
                </dl>
              </section>
            </div>

            {sessionError && (
              <div className="player-data-alert">{sessionError}</div>
            )}

            {session && !sessionError && (
              <section className="session-panel">
                <div className="player-section-heading">
                  <span className="player-section-label">Dados oficiais</span>
                  <h2>{this.getSessionTitle()}</h2>
                </div>

                <div className="session-details-card">
                  <dl className="session-facts-grid">
                    <div>
                      <dt>Data da sessão</dt>
                      <dd>{this.formatDate(session.Data)}</dd>
                    </div>
                    <div>
                      <dt>Expediente</dt>
                      <dd>{session.Expediente || 'Não disponível'}</dd>
                    </div>
                    <div>
                      <dt>Pauta</dt>
                      <dd>{session.Pauta || 'Não disponível'}</dd>
                    </div>
                  </dl>
                  {session.Url && (
                    <a href={session.Url} target="_blank" rel="noopener noreferrer">Ver sessão oficial</a>
                  )}
                </div>

                <div className="materias-session-block">
                  <div className="player-section-heading">
                    <span className="player-section-label">Matérias relacionadas</span>
                    <h2>{materias.length} em pauta</h2>
                  </div>
                  {materias.length > 0 ? (
                    <ul>
                      {materias.map(materia => (
                        <li key={materia.Id}>
                          <a href={materia.Url} target="_blank" rel="noopener noreferrer">
                            {`${materia.Tipo} ${materia.Numero}/${materia.Exercicio}`}
                          </a>
                          <p>{materia.Ementa || 'Ementa não disponível'}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhuma matéria encontrada para essa sessão.</p>
                  )}
                </div>
              </section>
            )}
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
