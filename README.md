参考： https://segmentfault.com/a/1190000023211627

从零开始webpack搭建react，redux应用
前言：
使用webpack已经有些年头了，但是对于其中的一些基本配置还是一知半解。为了成为一名优秀的webpack配置工程师，也是学习了一把webpack，react的配置，特分享此次经历，并记录当中遇到的一些问题。当然现在的配置只是很基础的，希望在以后的工作经历中，多多探索，把一些webpack优化，react，redux最佳实践，都加入到其中。

文章目录
webpack基础配置
配置react, less
引入antd,
react-router的使用
react-redux
redux异步中间件的选择 thunk/saga
项目优化：MiniCssExtractPlugin，路由切割懒加载，postcss-loader, url-loader, hmr，tree shaking,
devserver proxy，本地mock数据
lint & prettier
项目部署脚本
一. webpack基础配置
学习一个新技术，最好的获取方式便是阅读官方文档。（https://www.webpackjs.com/gui...）。通读以后，总结为以下几个要点。

初始化项目，安装依赖。
npm init -y
npm install webpack webpack-cli --save-dev
配置文件
// webpack.base.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
// package.json
"scripts": {
    "dev": "webpack --config webpackconfig/webpack.base.js",
},
// dist/index.html
<!doctype html>
<html>
<head>
    <title>hyt</title>
</head>
<body>
<script src="./main.bundle.js"></script>
</body>
</html>
// src/index.js
function component() {
    var element = document.createElement('div');
    element.innerHTML = 'hello world hyt';
    return element;
}

document.body.appendChild(component());
接下来运行 npm run dev，查看dist下输出，发现多了一个main.bundle.js文件，打开我们新建的index.html文件，可以看到如下，说明我们的webpack基础打包已经能够使用了。


如果我们更改了一个入口起点的名称，或者针对多入口添加了一个新的名称，又需要我们手动去index.html中去更改，我们可以使用HtmlWebpackPlugin动态生成index.html.
当然，避免我们每次手动去清空dist文件下的内容，可以使用clean-webpack-plugin插件帮助清空。

npm install html-webpack-plugin clean-webpack-plugin

// webpack.base.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
     new CleanWebpackPlugin(),
     new HtmlWebpackPlugin({
       title: 'Output Management'
     })
  ],
};
这里可以看到，HtmlWebpackPlugin已经帮助我们生成了html文件。

如上，我们已经掌握了webpack打包编译的基本使用。
但是在日常开发中，每次修改完代码都需要手动执行webpack打包命令，很繁琐。这时候可以采用 watch或者webpack-dev-server或者webpack-dev-middleware方法实现。较为常用的是使用webpack-dev-server，不仅提供一个简单的 web 服务器，并且能够实时重新加载。

npm install --save-dev webpack-dev-server

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },
  devServer: {
    contentBase: './dist',
    open: true,
    port: 8888,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management",
    }),
  ],
};
修改package.json

 "scripts": {
    "dev": "webpack-dev-server --config webpackconfig/webpack.base.js",
    "watch": "webpack --config webpackconfig/webpack.base.js --watch"
  },
执行 npm run dev，看看效果。

webpack-dev-server固然好用，但是只适用于开发环境，在生产环境中，我们的目标则转向于关注更小的 bundle，更轻量的 source map，以及更优化的资源，以改善加载时间。所以我们可以根据不同的环境，加载不同的webpack配置。
webpack.base.js是通用配置，webapck.dev.js中是开发环境配置，webapck.prod.js是生产环境配置。webpack-merge可以帮住我们很好的合并配置。

接下来拆分配置：

// webpack.base.js
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management",
    }),
  ],
};
// webpack.dev.js
const { merge } = require("webpack-merge");
const base = require("./webpack.base");

module.exports = merge(base, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    open: true,
    port: 8888,
  },
});
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const base = require("./webpack.base");

module.exports = merge(base, {
  mode: "production",
  devtool: "source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
});
// package.json
"scripts": {
    "dev": "webpack-dev-server --config webpackconfig/webpack.dev.js",
    "watch": "webpack --config webpackconfig/webpack.base.js --watch",
    "prod": "webpack --config webpackconfig/webpack.prod.js"
},
到目前为止，一个小型的webpack打包应用已经构建好了。接下来进入webpack应用中，引入react, css, less的处理。

二. 引入React, 处理css, less
安装React ,React-dom
npm install react react-domm
修改src/index.js，改为react组件格式代码。

import React from "react";
import ReactDOM from "react-dom";

const App = () => {
  return <div>hello world hyt</div>;
};

ReactDOM.render(<App />, document.getElementById("root"));
因为react-dom的渲染节点，需要挂在已经存在的id=root节点上，所以我们需要在生成的index.html中提前写入 root节点。此操作可以搭配之前提到的HtmlWebpackPlugin完成。添加template模板。

// src/template.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>


// webpack.base.js
new HtmlWebpackPlugin({
  title: 'hyt Management',
  template: './src/template.html',
}),
接下来运行，npm run dev，果然，报错了。



提示我们，应该需要专门的loader去处理我们的js/jsx文件。这时候，就是大名鼎鼎的babel登场了。babel可以帮助我们进行js文件的编译转换。

babel
除了帮助我们对于高版本js语法转换以外，还可以处理react的jsx写法。

npm install babel-loader @babel/preset-env @babel/preset-react @babel/core
更改webpack.base.js中rules规则。

module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }],
      },
    ],
},
根目录新增.babelrc配置文件

{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
接下来打包运行，npm run dev ，发现浏览器中终于显示了<div>hello world hyt</div>的dom（为了显示一行dom，我们费了这么大的功夫，不得不吐槽）。

接下来给页面加点样式。
有了刚才js打包报错的经验，应该明白，要想加入css文件，也需要有专门的loader去处理css文件，得以运行。

npm install css-loader style-loader
css-loader处理css文件为webpack可识别打包的，style-loader插入到页面style中。

rules: [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [{ loader: "babel-loader" }],
  },
  {
    test: /\.css$/,
    use: [
      {
        loader: "style-loader",
      },
      {
        loader: "css-loader",
      },
    ],
  },
]
// src/index.js

import "./style.css";

const App = () => {
  return <div className="hello">hello world hyt</div>;
};

// src/style.css
.hello {
  font-size: 30px;
  color: blue;
}
嗯，可以看到页面中有颜色了。。


这时候思考一个问题，假如在我们其他组件中，也有同样名字的class,再其对应的css文件中，写了不同的样式，会有什么结果，实验一下。

// src/components/about/index.js
import React from "react";
import "./style.css";

const About = (props) => {
  return <div className="hello">About</div>;
};

export default About;
// src/components/about/style.css
.hello {
    color: red;
}
// src/index.js

import About from "./components/about";

<About />
看下页面的展示，


发现color: red的样式并没有生效，打开控制台看下打包后的样式，名字一样的class，样式被覆盖了。


所以这个时候，就引入css modules的概念了，通过css-loader的配置，帮助我们实现css模块化。

{
    test: /\.css$/,
    use: [
      {
        loader: "style-loader",
      },
      {
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]", // css-loader >= 3.x，localIdentName放在modules里
          },
        },
      },
    ],
}
更改js文件中引入方式。

import style from "./style.css";
const About = (props) => {
  return <div className={style["hello"]}>About</div>;
};

index.js中同理
emm，样式果然生效了



less
既然都用到css了，和不使用使用预处理less呢，能够更加提效我们的开发。使用步骤和css大致相同，秩序多家less-loader先把less文件做一次转换，再走css-loader的流程。大概配置如下

npm install less-loader
{
    test: /\.less$/,
    use: [
      {
        loader: "style-loader", // creates style nodes from JS strings
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]", // css-loader >= 3.x，localIdentName放在modules里  https://github.com/rails/webpacker/issues/2197
          },
        },
      },
      {
        loader: "less-loader", // compiles Less to CSS
            options: {
              lessOptions: { javascriptEnabled: true },// less@3.x，需要开启 配置项 javascriptEnabled: true
            },
      },
    ],
  },
把About中的css文件改为less使用即可。接下来可以安心的写代码了。

三. Antd的使用，以及less的分别处理
为了提高我们的开发效率，在项目中引入antd组件库。

两种方法，全量引入css；或按需加载。（antd 4.x 的 JS 代码默认支持基于 ES modules 的 tree shaking。）https://ant.design/docs/react...

采用按需加载的方法来构建项目。

npm install antd babel-plugin-import

{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd",
        "libraryDirectory": "es",
        "style": true // `style: 'css'` 会加载 css 文件
      }
    ]
  ]
}

发现样式并没有加载成功。


原因是我们刚才在处理less文件时，没有区分src 和 node_modules，导致antd的class也加了modules，没有加载到正确的样式。修改less loader为

{
    test: /\.less$/,
    exclude: /node_modules/, // 这里做了修改
    use: [
      {
        loader: "style-loader", // creates style nodes from JS strings
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]", // css-loader >= 3.x，localIdentName放在modules里  https://github.com/rails/webpacker/issues/2197
          },
        },
      },
      {
        loader: "less-loader", // compiles Less to CSS
        options: {
          lessOptions: { javascriptEnabled: true },
        },
      },
    ],
  },
  {
    test: /\.less$/,
    include: /node_modules/, // 这里做了修改
    use: [
      {
        loader: "style-loader", // creates style nodes from JS strings
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
      },
      {
        loader: "less-loader", // compiles Less to CSS
        options: {
          lessOptions: { javascriptEnabled: true },
        }, // less@3.x，需要开启 配置项 javascriptEnabled: true, less-loader高版本需要lessOptions。
      },
    ],
  },
四. React-Router
接下来引入React-Router实现单页面应用。

具体用法可参考 https://reacttraining.com/rea...

npm install react-router-dom
修改index.js文件

import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

const App = () => {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
};
新建Routes.js

import React from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import About from "./components/about";
import User from "./components/user";

const Routes = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/user">User</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/User" component={User} />
        <Redirect to="/about" />
      </Switch>
    </div>
  );
};

export default Routes;
注意我们使用的是BrowserRouter，本地开发webpack devserver需要开启 historyApiFallback: true, 生产环境可以在nginx端try_files。

单页面应用ok了，接下来引入react-redux去管理我们的数据流。

五. Ract-redux
为什么选择redux来管理我们的数据流，以及redux的设计原理，可以查看阮一峰老师的系列文章，这里只给出基本使用。http://www.ruanyifeng.com/blo...

几个比较重要的概念，Provider，connect, creatStore, reducer, applyMiddleware，actions。

继续改造文件结构及内容

npm install redux react-redux
sotre
// src/store.js
import { createStore } from "redux";
import reducers from "./reducers/index";

const store = createStore(reducers, {});

export default store;
reducer
// src/reducers/index.js
import { combineReducers } from "redux";

const initialState = {
  name: "hyt",
};

function home(state = initialState, action) {
  switch (action.type) {
    case "TEST_REDUCER":
      return {
        ...state,
      };
    default:
      return state;
  }
}

export default combineReducers({
  home,
});
provider
// src/index.js

import { Provider } from "react-redux";
import Routes from "./Routes";
import store from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Provider>
  );
};
connect
新建容器组件container/home.js

import React from "react";
import { connect } from "react-redux";

const Home = (props) => {
  return <div>Home,{props.data.name}</div>;
};

export default connect((state) => ({ data: state.home }))(Home);
同样在route中引入home组件。
import Home from "./containers/home";
const Routes = () => {
  return (
    <div>
      <nav>
        <ul>
          ...
          <li>
            <Link to="/home">Home</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        ...
        <Route path="/home" component={Home} />
        <Redirect to="/about" />
      </Switch>
    </div>
  );
};
这是路由localhost:8080/home下就可以显示出 hello,hyt的数据。

dispatch actions
上面已经获取到了store中的数据，接下来dispatch去改变store中的数据，由于组件订阅了store（connect）,页面数据源会自动渲染变更。

6.1 添加action types常量

// src/constants/actionTypes.js
export const SET_USER_NAME = "SET_USER_NAME";
6.2 改变store的action

// src/actions/homeAction.js
import { SET_USER_NAME } from "../constants/actionsType";

export function setName(payload) {
  return { type: SET_USER_NAME, payload };
}
6.3 接受actions的reducer

// src/reducers/index.js
import { SET_USER_NAME } from "../constants/actionsType";

const initialState = {
  name: "hyt",
};

function home(state = initialState, action) {
  switch (action.type) {
    case SET_USER_NAME:
      return {
        ...state,
        name: action.payload.name,
      };
    default:
      return state;
  }
}
6.4 组件触发actions。增加了mapDispatchToProps。props.setName()

// src/containers/home.js
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { setName } from "../actions/homeAction";

const Home = (props) => {
  useEffect(() => {
    setTimeout(() => {
      props.setName({
        name: "wjh",
      });
    }, 3000);
  }, []);
  return <div>Home,{props.data.name}</div>;
};

const mapDispatchToProps = {
  setName,
};

export default connect(
  (state) => ({ data: state.home }),
  mapDispatchToProps
)(Home);
现在页面中的，hello,hyt 会在三秒后变成 hello,wjh。

六. redux中间件，thunk/saga

现在我们处理的是同步数据，接下来我们引入redux中间件，去处理异步action函数。

修改store，

npm install redux-thunk
// src/store.js
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers/index";

const store = createStore(reducers, {}, applyMiddleware(thunk));

export default store;
// src/actions/homeAction.js
export function getName(payload) {
  return (dispatch) => {
    return Promise.resolve().then((res) => {
      dispatch({
        type: SET_USER_NAME,
        payload: {
          name: "fetch mock",
        },
      });
      return res;
    });
  };
}
// src/containers/home.js
const Home = (props) => {
  useEffect(() => {
    setTimeout(() => {
      // props.setName({
      //   name: "wjh",
      // });
      props.getName();
    }, 3000);
  }, []);
  return <div>Home,{props.data.name}</div>;
};

const mapDispatchToProps = {
  setName,
  getName,
};
页面上已经变成了 hello,fetch mock.

saga的使用可以直接参考 https://github.com/hytStart/J...

七. 项目优化
路由切割懒加载。使用import() + react-loadable完成。
npm install react-loadable
修改Routes中组件引入方式，达到按路由拆分
js模块


import Loadable from "react-loadable";

const MyLoadingComponent = (props) => {
  if (props.pastDelay) {
    return <div>Loading...</div>;
  }
  return null;
};

const User = Loadable({
  loader: () => import("./components/user"),
  loading: MyLoadingComponent,
  delay: 300,
});
可以看到控制台js bundle加载。



热更新HMR
由于现在我们每改一下代码，都可以看到刷新一次页面，于是之前的路由跳转状态、表单中填入的数据都会重置。对于开发人员过程很不方便，这时候就引出我们的热更新了，不会造成页面刷新，而是进行模块的替换。

// webpack.dev.js

module.exports = merge(base, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    open: true,
    port: 8888,
    historyApiFallback: true,
    hot: true, // +++++++
  },
});
// index.js

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Provider>
  );
};

++++
if (module.hot) {
  module.hot.accept();
}
++++
ReactDOM.render(<App />, document.getElementById("root"));
url-loader & file-loader
现在我们的项目中还没有专门的loader去处理图片，

file-loader 可以指定要复制和放置资源文件的位置，以及如何使用版本哈希命名以获得更好的缓存。此外，这意味着 你可以就近管理图片文件，可以使用相对路径而不用担心部署时 URL 的问题。使用正确的配置，webpack 将会在打包输出中自动重写文件路径为正确的 URL。

url-loader 允许你有条件地将文件转换为内联的 base-64 URL (当文件小于给定的阈值)，这会减少小文件的 HTTP 请求数。如果文件大于该阈值，会自动的交给 file-loader 处理。

增加如下配置

npm install file-loader url-loader
// webpack.base.js
{
    test: /\.(mp4|ogg)$/,
    use: [
      {
        loader: 'file-loader',
      },
    ],
  },
  {
    test: /\.(png|jpg|jpeg|gif|eot|svg|ttf|woff|woff2)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
    ],
  },
MiniCssExtractPlugin
该插件将CSS提取到单独的文件中。它为每个包含CSS的JS文件创建一个CSS文件。它支持CSS和SourceMap的按需加载。

4.1 使用mini-css-extract-plugin

npm install --save-dev mini-css-extract-plugin
修改webpack.base.js中关于css,
less的配置，替换掉style-loader（不在需要把style插入到html中，而是通过link引入）。

{
    test: /\.css$/,
    use: [
      // {
      //   loader: "style-loader",
      // },
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
          hmr: process.env.NODE_ENV === "dev",
          reloadAll: true,
        },
      },
      {
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]", // css-loader >= 3.x，localIdentName放在modules里  https://github.com/rails/webpacker/issues/2197
          },
        },
      },
    ],
  },
  {
    test: /\.less$/,
    exclude: /node_modules/,
    use: [
      // {
      //   loader: "style-loader", // creates style nodes from JS strings
      // },
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
          hmr: process.env.NODE_ENV === "dev",
          reloadAll: true,
        },
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]", // css-loader >= 3.x，localIdentName放在modules里  https://github.com/rails/webpacker/issues/2197
          },
        },
      },
      {
        loader: "less-loader", // compiles Less to CSS
        options: {
          lessOptions: { javascriptEnabled: true },
        },
      },
    ],
  },
  {
    test: /\.less$/,
    include: /node_modules/,
    use: [
      // {
      //   loader: "style-loader", // creates style nodes from JS strings
      // },
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
          hmr: process.env.NODE_ENV === "dev",
          reloadAll: true,
        },
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
      },
      {
        loader: "less-loader", // compiles Less to CSS
        options: {
          lessOptions: { javascriptEnabled: true },
        }, // less@3.x，需要开启 配置项 javascriptEnabled: true, less-loader高版本需要lessOptions。
      },
    ],
  },
4.2 如上配置，增加hrm配置

hmr: process.env.NODE_ENV === "dev"
同时在package.json scripts中注入环境变量

"scripts": {
    "dev": "NODE_ENV=dev webpack-dev-server --config webpackconfig/webpack.dev.js",
    "watch": "NODE_ENV=dev webpack --config webpackconfig/webpack.base.js --watch",
    "prod": "webpack --config webpackconfig/webpack.prod.js"
},
4.3 plugin配置

plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management",
      template: "./src/template.html",
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
到目前为止，我们已经根据引入文件的方式，分离除了css，做到了按需加载。但是现在可以查看打包出来的css文件是没有经过压缩的。



4.4 增加optimize-css-assets-webpack-plugin来压缩css代码，但是这时又会出现另外一个问题，optimization.minimizer会覆盖webpack提供的默认设置，因此还需增加terser-webpack-plugin来压缩js代码。

npm install --save-dev optimize-css-assets-webpack-plugin terser-webpack-plugin
// webapack.base.js
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");


plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management",
      template: "./src/template.html",
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
],
optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
},