const core = require('@actions/core');
const github = require('@actions/github');
const greetingContributor = require('../../scripts/greetingContributor');
const storyGenerator = require('../../scripts/storyGenerator');

(async () => {
  try {
    const githubToken = core.getInput('github-token', { required: true });
    const issueMessage = core.getInput('issue-message');
    const prMessage = core.getInput('pr-message');
    const footer = core.getInput('footer');
    const client = github.getOctokit(githubToken);
    const context = github.context;

    switch (context.payload.action) {
      case 'closed':
        await storyGenerator(client, context)
        break;
      case 'opened':
        await greetingContributor(client, context, issueMessage, prMessage, footer)
        break;
      default:
        console.log('No action, skipping');
        core.setFailed('No action, skipping!');
        break;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})()
