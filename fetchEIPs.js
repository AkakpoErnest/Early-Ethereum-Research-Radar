const { Octokit } = require("@octokit/rest");
const axios = require("axios");

const octokit = new Octokit();

const repoOwner = "ethereum";
const repoName = "EIPs";

async function fetchEIPs() {
  try {
    const files = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: "EIPS"
    });

    const markdownFiles = files.data.filter(file => file.name.endsWith(".md"));

    const eips = await Promise.all(markdownFiles.map(async file => {
      const rawUrl = file.download_url;
      const content = (await axios.get(rawUrl)).data;

      const titleMatch = content.match(/title:\s*(.+)/i);
      const statusMatch = content.match(/status:\s*(.+)/i);
      const categoryMatch = content.match(/category:\s*(.+)/i);
      const eipNum = file.name.replace(".md", "");

      return {
        number: eipNum,
        title: titleMatch ? titleMatch[1].trim() : "Untitled",
        status: statusMatch ? statusMatch[1].trim() : "Unknown",
        category: categoryMatch ? categoryMatch[1].trim() : "General",
        url: file.html_url,
      };
    }));

    console.log("Fetched EIPs:", eips.slice(0, 5)); // show a preview
    return eips;
  } catch (error) {
    console.error("Error fetching EIPs:", error);
  }
}

fetchEIPs();
