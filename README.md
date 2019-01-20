# webpack-dependency-flow

This is a webpack plugin that can help you visualize the dependencies between files.

## Install

```sh
npm install webpack-dependency-flow
```

## Usage

```js
const DependencyFlow = require('webpack-dependency-flow');

// rollup config
module.exports = {
  plugins: [
    new DependencyFlow()
  ]
};
```

## API

### class DependencyFlow(build, serve)

The plugin entry point. The plugin can generate a static htlm file of the dependency flow, or run a web server in watch mode which updates live on filesave.

- build `object | false` - Creates a static `html` file. Default: `{}`
  - dir `string` - Directory location.
  - name `string` - Name of the file.
- serve `object | false` - Starts a web server (can only be run in watch mode). Default: `false`
  - port `number` - Port to run the web server on.
  - wsPort `number` - Websocket port used to pass data between node process and web server.
  - Returns

The web server usually runs on `localhost:3001` if the ports are available, check the console output for `Serving dependency flow at: <adress>` to see where the server is running.

#### Examples

```js
// Run web server only
new DependencyFlow(false, {
  port: 8085, // run web server on port 8085
  wsPort: 5055 // run websocket on 5055
});

// Create static file only
new DependencyFlow();
```
