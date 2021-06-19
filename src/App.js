import './App.css';
import {BrowserRouter as Router} from 'react-router-dom';
import myStore from './redux/store';
import { Provider } from 'react-redux';
import Main from './components/Main';

function App() {
  return (
    <Provider store={myStore}>
      <Router>
        <div className="App">
          <Main />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
