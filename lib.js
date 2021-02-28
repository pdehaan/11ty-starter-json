const path = require("path");

const degit = require("degit");
const fs = require("fs-extra");
const globby = require("globby");
const hostedGitInfo = require("hosted-git-info");

const github = require("./github");

module.exports = {
  repoFromUrl,
  getStarters,
};

function repoFromUrl(url) {
  const info = hostedGitInfo.fromUrl(url);
  return {
    owner: info.user,
    repo: info.project,
  };
}

async function getStarters(outputDir = "starters") {
  const emitter = degit("11ty/11ty-website/_data/starters", {
    cache: false,
    force: true,
    verbose: false,
  });

  const $outputDir = path.join(__dirname, outputDir);
  const $outputFileGlob = path.join($outputDir, "*.json");

  await emitter.clone($outputDir);
  const starters = await globby($outputFileGlob);
  const arr = [];
  for (const starter of starters) {
    const file = await fs.readJSON(starter);
    try {
      const { owner, repo } = repoFromUrl(file.url);
      file.pkg = await github.getPackageJson(owner, repo);
      file.eleventy = getDependencyVersion(file.pkg, "@11ty/eleventy"); // file.pkg.content?.dependencies?["@11ty/eleventy"] || file.pkg.content?.devDependencies?["@11ty/eleventy"];
      file.github = await github.getRepo(owner, repo);
      if (!file.github.archived || !file.github.disabled) {
        arr.push(file);
      }
    } catch (err) {
      console.error(`[${file.name}] ${err.message} -- ${file.url}`);
    }
  }
  return arr.sort((left, right) => {
    if (left.official || right.official) {
      return Number(right.official || 0) - Number(left.official || 0);
    }
    return right.github.stargazers_count - left.github.stargazers_count;
  });
}

function getDependencyVersion(pkg, name) {
  return pkg.dependencies?.[name] || pkg.devDependencies?.[name];
}
