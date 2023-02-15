import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import '../App.css'

import {connect} from 'react-redux'
import {clickButton, visitRegister} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'


// ITEMS ICONS


  //mudança de páginas
  function list(){
    window.location.href = "/listItems"
  }
  function inicio(){
    window.location.href = "/inicio"
  }
  function itemClick(){
    window.location.href = "/item"
    console.log(this.state.id)
  }

  class Visitante extends Component{
    constructor(props){
      super(props)
      this.state = {
        id: '566',
        tipo: 'VISITANTE',

        nomeVisit: '',
        sobrenomeVisit:'',
        cpfVisit: '',
        tipoVisit: '',
        veiculoVisit: '',
        placaVisit:'',

        visitantes: [],

        botao: 'Cadastrar',

        carregar: 'Carregar Visitantes',
        btnLoad: 'visitanteBtn',
      }
    }

    // Visitantes
   loadVisitante = async () =>{
    await axios.get(`/visitante.json`)
            .catch(err => console.log(err))
            .then(res => {
                const visitAll = res.data
                let visitantes = []
                for(let key in visitAll){
                    visitantes.push({
                        ...visitAll[key],
                        id: key
                    })
                }
                // consultas
                visitantes = visitantes.filter(content => {
                    return content.condominio.includes(this.props.condominio)
                })
                visitantes = visitantes.filter(content => {
                  return content.morador.includes(this.props.nome)
              })

                this.setState({visitantes: visitantes})
            })
  }
  componentDidMount(){
    const loadPage = () => this.loadVisitante()
    loadPage()
  }

  render(){
  
  // Visitantes
  const visitantes = this.state.visitantes 

  const listVisitante = visitantes.map((visitante) => 
        <li className="Areas type1">
                {/* <img src={imgVisitante} /> */}
                <p>{visitante.nome} {visitante.sobrenome}</p>
                <p>{visitante.cpf}</p>
        </li>
  )
  
    return (
       
        <section className="section" id="visitantes">
            <h1 className="titleSection"><img src={iconVisitantes} width='50px' 
            // onClick={loadVisitante()}
            />Visitantes</h1>
            <ul className="listAreas2" >
              {listVisitante}
            </ul>
            <form>
              {/* value={this.state.morador} onChange={(event) => this.setState({morador: event.target.value})} */}
              <input type="text" placeholder="Nome" className="visitanteInput" value={this.state.nomeVisit} onChange={(event) => this.setState({nomeVisit: event.target.value})}/>
              <input type="text" placeholder="Sobrenome" className="visitanteInput" value={this.state.sobrenomeVisit} onChange={(event) => this.setState({sobrenomeVisit: event.target.value})}/>
              <input type="text" placeholder="CPF" className="visitanteInput" value={this.state.cpfVisit} onChange={(event) => this.setState({cpfVisit: event.target.value})}/>
              <select className="visitanteInput" value={this.state.tipoVisit} onChange={(event) => this.setState({tipoVisit: event.target.value})}>
                <option value="">Selecione o tipo</option>
                <option value="Morador">Morador</option>
                <option value="Visita">Visita</option>
                <option value="Serviço">Serviço</option>
              </select>
              <input type="text" placeholder="Veiculo" className="visitanteInput" value={this.state.veiculoVisit} onChange={(event) => this.setState({veiculoVisit:event.target.value})}/>
              <input type="text" placeholder="Placa do Veiculo" className="visitanteInput" value={this.state.placaVisit} onChange={(event) => this.setState({placaVisit:event.target.value})}/>
              <br/>
              <input type="button" value={this.state.botao} className="visitanteBtn" 
              onClick={() => {
                if(this.state.nomeVisit === ''){
                  this.setState({botao: 'Digite o Nome'})
                }
                else if(this.state.sobrenomeVisit === ''){
                  this.setState({botao: 'Digite o Sobrenome'})
                }
                else if(this.state.cpfVisit === ''){
                  this.setState({botao: 'Digite o CPF'})
                }
                else if(this.state.tipoVisit === ''){
                  this.setState({botao: 'Selecione o Tipo'})
                }
                else{
                  axios.post(`/visitante.json`, {
                    nome: this.state.nomeVisit,
                    sobrenome: this.state.sobrenomeVisit,
                    cpf: this.state.cpfVisit,
                    tipo: this.state.tipoVisit,
                    veiculo: this.state.veiculoVisit,
                    placa: this.state.placaVisit,
                    data: new Date(),
                    condominio: this.props.condominio,
                    morador: this.props.nome,
                  })
                  this.setState({botao: 'Enviando', nomeVisit: '', sobrenomeVisit: '', cpfVisit: '', tipoVisit:'', veiculoVisit:'', placaVisit: '' })
                  setInterval(() => {
                    this.setState({
                      botao: 'Cadastrar',
                    })
                    this.loadVisitante()
                  }, 2000)
                }
              }
              }/>
            </form>
        </section>

    );
  }
}

const mapStateToProps = store => {
  return{
    id: store.lembretes.id,
    tipo: store.user.tipo,
    nome: store.user.name,
    condominio: store.user.condominio,
  }
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators({clickButton}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Visitante);
// export default Visitante;