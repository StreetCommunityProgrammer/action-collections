const slugify = require('./utils/slugify');
const { ghBotUsername, ghBotEmail } = require('./utils/git');

/**
 * Creates a new metaphor file in the specified category, based on the provided issue data and context.
 * @async
 * @function createMetaphorFile
 * @param {Object} client - The client object containing information about the GitHub repository and issue, including owner, repo, and issue number.
 * @param {Object} issueData - The issue data object containing information about the issue, including title, user, created date, and body content.
 * @param {Object} context - The context object containing information about the GitHub repository and issue, including owner, repo, and issue number.
 * @param {string} category - The category of the metaphor file to create.
 * @returns {Promise} A Promise that resolves when the metaphor file has been created in the GitHub repository.
 */
async function createMetaphorFile(client, issueData, context, category) {
  const metaphorTitle = slugify(issueData.title);

  const template = `---
layout: post
title: {title}
author: {author}
created_at: {created_at}
language: {language}
---

{content}`;

  const placeholders = ['{title}', '{author}', '{created_at}', '{language}', '{content}'];
  const values = [
    issueData.title,
    issueData.user.login,
    issueData.created_at,
    category,
    issueData.body,
  ];

  const replacedTemplate = placeholders.reduce((template, placeholder, index) => {
    return template.replace(new RegExp(placeholder, 'g'), values[index]);
  }, template);
  console.log('Replacement result: ' + JSON.stringify(replacedTemplate, undefined, 2))

  const metaphorContent = Buffer.from(replacedTemplate).toString('base64');
  const createContent = await createFileContent({
    client: client,
    owner: context.issue.owner,
    repo: context.issue.repo,
    path: `public/collections/stories/${category}/${metaphorTitle}.md`,
    message: `docs(generate): new metaphor from @${issueData.user.login}`,
    content: metaphorContent,
  });

  console.log(`Content Metadata: ${JSON.stringify(createContent, undefined, 2)}`);
}

/**
 * Adds labels to a closed issue.
 *
 * @param {Object} client - The authenticated Octokit REST client.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {number} issue_number - The number of the issue to add labels to.
 * @param {Array} [labels] - An array of labels to add to the issue.
 * @returns {Promise<void>} A Promise that resolves when the labels have been added to the issue.
 */
async function addLabelToClosedIssue(client, owner, repo, issue_number, labels) {
  await client.rest.issues.addLabels({
    owner,
    repo,
    issue_number,
    labels
  })
  console.log(`Label added: ${labels.join(', ')}`)
}

/**
 * Creates or updates a file in a GitHub repository with the specified content.
 * @async
 * @function createFileContent
 * @param {Object} options - An object containing options for the file creation/update operation.
 * @param {string} options.owner - The owner of the GitHub repository.
 * @param {string} options.repo - The name of the GitHub repository.
 * @param {string} options.path - The path to the file in the repository.
 * @param {string} options.message - The commit message to use for the file update/creation.
 * @param {string} options.content - The content of the file to create/update, encoded in base64.
 * @returns {Promise<Object>} A Promise that resolves with the metadata for the created/updated file.
 */
async function createFileContent({ client, owner, repo, path, message, content }) {
  return await client.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content,
    committer: {
      name: ghBotUsername,
      email: ghBotEmail
    },
    author: {
      name: ghBotUsername,
      email: ghBotEmail
    }
  });
}

module.exports = async (client, context) => {
  try {
    const issue = await client.rest.issues.get({
      owner: context.issue.owner,
      repo: context.issue.repo,
      issue_number: context.issue.number,
    })

    const assignees = issue.data.assignees
    const isReviewerPresence = assignees.some(assignee => ['darkterminal', 'mkubdev'].includes(assignee.login))
    if (issue.data.state === 'closed' && isReviewerPresence) {
      const labels = issue.data.labels.map(label => label.name)

      const metaphors = [
        ['linux', 'linux'],
        ['cpp', 'cpp'],
        ['css', 'css'],
        ['golang', 'golang'],
        ['javascript', 'javascript'],
        ['java', 'java'],
        ['maths', 'maths'],
        ['python', 'python'],
        ['php', 'php'],
        ['physics', 'physics'],
        ['ruby', 'ruby'],
        ['rust', 'rust'],
        ['zig', 'zig']
      ]

      const isMetaphor = metaphors.some(([category, label]) => labels.every(l => ['metaphore', category].includes(l)))

      if (isMetaphor) {
        const [category, label] = metaphors.find(([category, label]) => labels.every(l => ['metaphore', category].includes(l)))
        console.log(`Is ${category} metaphor`)
        createMetaphorFile(client, issue.data, context, label)
      }

      addLabelToClosedIssue(client, context.issue.owner, context.issue.repo, context.issue.number, [...labels, 'published'])
    }
  } catch (error) {
    console.log(`Error on storyGenerator: ${error}`)
    return false
  }
}
