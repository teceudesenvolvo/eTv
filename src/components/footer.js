import React from 'react';
import { FaInstagram, FaFacebook, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import '../App.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section institutional">
                    <img src="https://www.cmpacatuba.ce.gov.br/imagens/logovazada.png" alt="Câmara Pacatuba Logo" className="footer-logo" />
                    <p className="footer-cnpj">CNPJ: 06.578.447/0001-29</p>
                    <p className="footer-legislature">Legislatura: 2025/2028</p>
                </div>

                <div className="footer-section contact">
                    <h4 className="footer-title">Contato</h4>
                    <ul className="footer-list">
                        <li><FaMapMarkerAlt /> Rua Major Crisanto de Almeida, 195 - Centro, Pacatuba - CE</li>
                        <li><FaPhone /> (85) 3345-1284</li>
                        <li><FaEnvelope /> camaramunicipaldepacatuba@gmail.com</li>
                    </ul>
                </div>

                <div className="footer-section hours">
                    <h4 className="footer-title">Expediente</h4>
                    <ul className="footer-list">
                        <li><FaClock /> Seg, Qua, Sex: 08:00 às 14:00</li>
                        <li><FaClock /> Ter e Qui: 08:00 às 12:00 e 14:00 às 18:00</li>
                    </ul>
                </div>

                <div className="footer-section social">
                    <h4 className="footer-title">Siga-nos</h4>
                    <div className="social-links">
                        <a href="https://www.instagram.com/camara_pacatuba/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://www.facebook.com/tvcamarapacatuba/" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href="https://www.youtube.com/channel/UCGXhrFTkevDVos5fFyl7HHg" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Câmara Municipal de Pacatuba. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
