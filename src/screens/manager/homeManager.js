import React, { Component } from 'react';
import logo from '../../assets/images/LOGO-MEUHALL-SF.png'
import '../../App.css'

import {connect} from 'react-redux'
import {clickButton} from '../../store/actions/index'
import { bindActionCreators } from 'redux';

import ReactDOM from 'react-dom'

import axios from 'axios'
import moment from 'moment'


  class Home extends Component{
    render(){return}
  }

  export default Home


// const mapStateToProps = store => {
//   return{
//     nome: store.user.name,
//     condominio: store.user.condominio,
//   }
// };

// const mapDispatchToProps = dispatch =>
//   bindActionCreators({ clickButton }, dispatch);

// export default connect(mapStateToProps, mapDispatchToProps)(Home);
