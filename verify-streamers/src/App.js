import React, { Component } from 'react';
import './App.css';
import Container from '@material-ui/core/Container';
import ModeTabs from './ModeTabs';

class App extends Component {

    state = {
        unverifiedStreamers: [],
        verifiedStreamers: []
    };

    handleOnChange = props => {
        this.setState(props);
    };

    render() {
        return (
                <Container>
                     <ModeTabs unverifiedStreamers={this.state.unverifiedStreamers} verifiedStreamers={this.state.verifiedStreamers} onChange={this.handleOnChange}>
                     </ModeTabs>
                </Container>
        );
    }

  componentDidMount() {
    fetch('http://localhost:3000/unverifiedStreamers')
    .then(res => res.json())
    .then((data) => {
      this.setState({ unverifiedStreamers: data })
    })
    .catch(console.log)

    fetch('https://raw.githubusercontent.com/rhoiyds/osrs-streamers/master/resources/streamers.json')
        .then(res => res.json())
        .then((data) => {
          this.setState({ verifiedStreamers: data })
        })
    .catch(console.log)
  }
}

export default App;
