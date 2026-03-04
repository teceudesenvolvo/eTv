import React from 'react';
import '../App.css'

import { connect } from 'react-redux'
import { LoggedOut } from '../store/actions/index'
import { bindActionCreators } from 'redux';

import firebase from 'firebase'

import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa'


// ITEMS MENU
const logo = 'https://www.cmpacatuba.ce.gov.br/imagens/logo.png';

function goInicio() {
  window.location.href = "/"
}

// function goSingup() {
//   window.location.href = "/cadastro"
// }








class MainMenu extends React.Component {

  componentDidMount() {
    if (this.props.userId) {
      this.setState({
        profileOptions: 'Profile',
        profileOptions2: 'Sair'
      })
    }
  }




  constructor(props) {
    super(props)
    this.state = {
      profileOptions: 'Login',
      profileOptions2: 'Cadastre-se'
    }
  }

  logOut = () => {
    this.props.LoggedOut(this.state)
    window.location.href = "/login"
  }

  goLogin = () => {
    firebase.auth().signOut().then(() => {
      this.props.LoggedOut(this.state)
      window.location.href = "/login"
    })
  }

  goProfile = () => {
    if (this.props.userId) {
      window.location.href = "/dashboard"
    } else {
      window.location.href = "/login"
    }

  }



  render() {
    // menu-menu
    return (
      <nav className="main-menu">

        <img className="logo-menu" src={logo} onClick={goInicio} alt='logomarca' />

        <div className="menu-items">
          {/* <a className="itemsMenu" onClick={goInicio}>Podcast</a>
          <a className="itemsMenu">Talk Show</a>
          <a className="itemsMenu">Class</a> */}
        </div>

        <div className="right-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="left-menu" style={{ margin: 0, padding: 0 }}>
            <FaSearch className="search-icon" />
            <a href="/buscar" className="left-menu-item" style={{ marginLeft: '5px', marginRight: '15px' }}>Buscar</a>
            <FaBell className="notification" />
          </div>
          <div className="profile-items" style={{ position: 'relative', top: 0, left: 0, margin: 0, width: 'auto' }}>
            {/* <img className="profile-icon" onClick={goProfile} src={profile} /> */}
            <FaUserCircle className="profile-icon" onClick={this.goProfile} style={{ margin: 0 }} />
            {/* <FaAngleDown/> */}
            <div className="dropMenu">
              <ul className="dropMenu-items">
                {/* dropdown options commented out in original */}
              </ul>
            </div>
          </div>
        </div>

      </nav>
    );
  }
}

const mapStateToProps = store => {
  return {
    email: store.user.email,
    userId: store.user.userId,
  }
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedOut }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(MainMenu)