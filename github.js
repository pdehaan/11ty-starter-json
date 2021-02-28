const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

module.exports = {
  getRepo,
  getFile,
  getPackageJson,
};

async function getRepo(owner, repo) {
  const res = await octokit.request("GET /repos/{owner}/{repo}", {
    owner,
    repo,
  });
  return res.data;
}

async function getFile(owner, repo, path) {
  const res = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
    }
  );
  const data = res.data;
  data.content = base64ToAscii(data.content);
  return data;
}

async function getPackageJson(owner, repo) {
  const file = await getFile(owner, repo, "package.json");
  const content = JSON.parse(file.content);
  content.$meta = file;
  return content;
}

function base64ToAscii(content) {
  return Buffer.from(content, "base64").toString("ascii");
}
