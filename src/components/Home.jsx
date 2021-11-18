import { Component } from 'react'
import './Home.css'

import Header from './Header'
import ButtonStart from './ButtonStart'
import LastScore from './LastScore'


class Home extends Component {

    state = {
        lastScore : 0
    }
    
    start() {
        // função que vai chamar o ajax para carregar a pagina do jogo
    }

    render() {
        return (
            <div className="home-body">
                <Header/>
                <main className="home-main">
                    <span>Use as setinhas para mudar a direção da cobrinha.</span>
                    <ButtonStart start={this.start.bind(this)}/>
                    <LastScore lastScore={this.state.lastScore}/>
                </main>
            </div>
        )
    }
}


export default Home