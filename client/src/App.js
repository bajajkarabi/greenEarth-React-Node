import React, { Component } from 'react';
import Landing from './Landing';
import { BrowserRouter, Route } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={Landing} />
      </BrowserRouter>
    );
  }
}

export default App;
