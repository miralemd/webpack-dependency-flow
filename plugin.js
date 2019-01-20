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
      traverse(m.modules, links, mods);
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
  constructor(build = {}, serve = false) {
    this.build = build === true ? {} : build;
    this.serve = serve === true ? {} : serve;
  }

  apply(compiler) {
    let serve;
    if (this.serve) {
      compiler.hooks.watchRun.tap('Dependency Flow', () => {
        serve = serve || flow.serve(this.serve);
      });
      compiler.hooks.watchClose.tap('Dependency Flow', () => {
        if (serve) {
          serve.close();
        }
      });
    }
    compiler.hooks.emit.tap('Dependency Flow', (compilation) => {
      const data = {
        links: [],
        modules: {},
      };
      const stats = compilation.getStats().toJson();
      let name = 'dependency-flow';
      const entry = stats.chunks.filter(c => c.entry)[0];
      if (entry && entry.names[0]) {
        name = `${entry.names[0]}-dependency-flow`;
      }
      traverse(stats.modules, data.links, data.modules);
      if (serve) {
        serve.update(data);
      }
      if (this.build) {
        flow.build(data, {
          name,
          dir: stats.outputPath,
          ...this.build,
        });
      }
    });
  }
}

module.exports = DependencyFlow;
