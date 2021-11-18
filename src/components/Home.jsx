import { Component } from 'react'

import Header from './Header'
import ButtonStart from './ButtonStart'
import LastScore from './LastScore'

class Home extends Component {
    
    start() {
        // função que vai chamar o ajax para carregar a pagina do jogo
    }

    render() {
        return (
            <div>
                <Header/>
                <div>
                    <span>Use as setinhas para mudar a direção da cobrinha.</span>
                    <ButtonStart start={this.start.bind(this)}/>
                    <LastScore lastScore={this.stats.lastScore}/>
                </div>
            </div>
        )
    }
}


export default Home