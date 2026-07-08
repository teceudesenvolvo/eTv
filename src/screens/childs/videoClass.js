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
      videos: '',
      session: null,
      materias: [],
      sessionLoading: true,
      sessionError: null,
      activeModal: null,
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

  getMateriaTitle = materia => {
    const tipo = materia.Tipo || materia.Especie || 'Matéria';
    const numero = materia.Numero ? ` ${materia.Numero}` : '';
    const exercicio = materia.Exercicio ? `/${materia.Exercicio}` : '';
    return `${tipo}${numero}${exercicio}`.trim();
  }

  getMateriaSummary = materia => {
    const rawSummary = materia.Ementa || materia.Descricao || materia.Assunto || materia.Texto || '';
    return String(rawSummary).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

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
  }

  closeModal = () => {
    this.setState({ activeModal: null });
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
      activeModal,
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

          <div className="video-details-container player-content-layout">
            <section className="player-primary-column">
              <header className="video-info-header">
                <span className="player-kicker">TV Câmara Pacatuba</span>
                <h1 className="video-title-premium">{title || 'Carregando transmissão...'}</h1>
                <div className="video-meta-premium">
                  <span className="publish-date">{this.formatDate(dataPublic)}</span>
                  <span>{this.getSessionTitle()}</span>
                </div>
              </header>

              <div className="player-data-section video-description-premium">
                <span className="player-section-label">Resumo do vídeo</span>
                <p>{description || 'Descrição não disponível para este vídeo.'}</p>
              </div>
            </section>

            <aside className="player-side-panel">
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
                <div>
                  <dt>Matérias vinculadas</dt>
                  <dd>{materias.length}</dd>
                </div>
              </dl>
            </aside>

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
                    <div className="matter-grid-modern player-matter-grid">
                      {materias.map(materia => (
                        <article key={materia.Id || `${materia.Numero}-${materia.Exercicio}`} className="matter-card-modern player-matter-card">
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

        {activeModal && (
          <div className="content-modal-overlay" role="presentation" onClick={this.closeModal}>
            <div className="content-modal-card" role="dialog" aria-modal="true" aria-labelledby="player-content-modal-title" onClick={event => event.stopPropagation()}>
              <button type="button" className="content-modal-close" aria-label="Fechar" onClick={this.closeModal}>
                ×
              </button>
              <span className="content-modal-kicker">{activeModal.kicker}</span>
              <h2 id="player-content-modal-title">{activeModal.title}</h2>
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
