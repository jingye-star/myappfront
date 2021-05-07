import React from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import Loadable from 'react-loadable'
import MyLoading from 'src/components/MyLoading/index.tsx';

const Home = Loadable({
  loader: () => import('src/pages/Home/index.tsx'),
  loading: MyLoading,
  delay: 100,
})

const User = Loadable({
  loader: () => import('src/pages/User/index.jsx'),
  loading: MyLoading,
  delay: 100,
})

const About = Loadable({
  loader: () => import('src/pages/About/index.jsx'),
  loading: MyLoading,
  delay: 100,
})

const Routes = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/user">User</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/user" component={User} />
        <Redirect to="/home" />
      </Switch>
    </div>
  );
};

export default Routes;
