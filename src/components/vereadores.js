import React, { Component } from 'react';
import axios from 'axios';
import '../App.css';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';

class Vereadores extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vereadores: [],
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        this.fetchVereadores();
    }

    fetchVereadores = async () => {
        try {
            const url = 'https://www.cmpacatuba.ce.gov.br/dadosabertosexportar?d=vereadores&a=&f=json&itens_por_pagina=20';
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
            const response = await axios.get(proxyUrl);
            this.setState({
                vereadores: response.data,
                loading: false
            });
        } catch (error) {
            console.error('Erro ao buscar vereadores:', error);
            this.setState({ error: 'Erro ao carregar vereadores', loading: false });
        }
    };

    render() {
        const { vereadores, loading, error } = this.state;

        if (loading) return <div className="loader-container">Carregando vereadores...</div>;
        if (error) return <div className="error-message">{error}</div>;

        const splideOptions = {
            type: 'loop',
            perPage: 5,
            perMove: 1,
            gap: '20px',
            autoplay: true,
            interval: 3000,
            pauseOnHover: true,
            arrows: true,
            pagination: true,
            breakpoints: {
                1200: { perPage: 4 },
                900: { perPage: 3 },
                600: { perPage: 2 },
                400: { perPage: 1 },
            }
        };

        return (
            <section className="vereadores-section">
                <div className="divTitleSection">
                    <h1 className="titleSection">Vereadores</h1>
                    <p className="newsSection">Parlamentares da Câmara de Pacatuba</p>
                </div>
                <Splide options={splideOptions} className="vereadores-splide">
                    {vereadores.map((v) => (
                        <SplideSlide key={v.Id}>
                            <div className="vereador-card" onClick={() => window.open(v.Url, '_blank')}>
                                <div className="vereador-image-container">
                                    <img src={v.Foto} alt={v.NomeParlamentar} className="vereador-img" />
                                </div>
                                <div className="vereador-info">
                                    <h3 className="vereador-nome">{v.NomeParlamentar}</h3>
                                    <p className="vereador-cargo">{v.Cargo}</p>
                                    <p className="vereador-partido">{v.Partido}</p>
                                </div>
                            </div>
                        </SplideSlide>
                    ))}
                </Splide>
            </section>
        );
    }
}

export default Vereadores;
