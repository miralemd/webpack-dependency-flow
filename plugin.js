const flow = require('dependency-flow');

const cwd = process.cwd();

const normalizePath = (s) => {
  let p = s.split('!');
  p = p[p.length - 1];
  return p.replace(cwd, '');
};

const nm = /node_modules/;

function traverse(modules, links, mods) {
  modules.forEach((m) => {
    if (m.modules) {
      traverse(m.modules, links);
    } else if (!nm.test(m.issuerName)) {
      const from = normalizePath(
        m.issuerPath == null
          ? '__entry__'
          : m.issuerPath[m.issuerPath.length - 1].identifier,
      );
      const to = normalizePath(m.identifier);
      if (!mods[to]) {
        mods[to] = {
          size: m.size,
        };
      }
      links.push([from, to]);
    }
  });
}

class DependencyFlow {
  apply(compiler) {
    let f;
    compiler.hooks.watchRun.tap('Dependency Flow', () => {
      f = f || flow();
    });
    compiler.hooks.watchClose.tap('Dependency Flow', () => {
      if (f) {
        f.close();
      }
    });
    compiler.hooks.emit.tap('Dependency Flow', (compilation) => {
      if (!f) {
        return;
      }
      const links = [];
      const modules = {};

      traverse(compilation.getStats().toJson().modules, links, modules);
      f.update(JSON.stringify({
        links,
        modules,
      }));
    });
  }
}

module.exports = DependencyFlow;
