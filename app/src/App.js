import React from 'react';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.disableDragDrop();
  }

  render() {
    return <div>Hello World</div>;
  }

  disableDragDrop = () => {
    if (window) {
      window.onload = event => {
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
      };
    }
  };
}

export default App;
