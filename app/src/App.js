import React from 'react';
import './App.scss';

class App extends React.Component {
  constructor() {
    super({});

    this.disableDragDrop();
  }

  render() {
    return <div>Hello World</div>;
  }

  disableDragDrop = () => {
    if (window) {
      window.onload = () => {
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
      };
    }
  };
}

export default App;
