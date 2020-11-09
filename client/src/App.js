import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/ath/Register';
import Login from './components/ath/Login';


const App = () =>
  <BrowserRouter>
    <>
      <Navbar />
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </section>
    </>
  </BrowserRouter>

export default App;
