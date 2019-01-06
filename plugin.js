const flow = require('dependency-flow');

const cwd = process.cwd();

const normalizePath = (s) => {
  let p = s.split('!');
  p = p[p.length - 1];
  return p.replace(cwd, '');
};

const nm = /node_modules/;

function traverse(modules, table) {
  modules.forEach((m) => {
    if (m.modules) {
      traverse(m.modules, table);
    } else if (!nm.test(m.issuerName)) {
      const from = normalizePath(
        m.issuerPath == null
          ? '__entry__'
          : m.issuerPath[m.issuerPath.length - 1].identifier,
      );
      const to = normalizePath(m.identifier);
      table.push([from, to, m.size]);
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
      const table = [];
      traverse(compilation.getStats().toJson().modules, table);
      f.update(JSON.stringify(table));
    });
  }
}

module.exports = DependencyFlow;
