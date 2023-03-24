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

  const contentValues = [
    issueData.title,
    issueData.user.login,
    issueData.created_at,
    category,
    issueData.body,
  ];

  const storyTemplate = `---
layout: post
title: {title}
author: {author}
created_at: {created_at}
language: {language}
---

{content}`;

  const replacementResult = contentValues.reduce((storyTemplate, placeholder, index) => {
    return storyTemplate.replace(new RegExp(placeholder, 'g'), contentValues[index]);
  }, storyTemplate);
  console.log('Replacement result: ' + JSON.stringify(replacementResult, undefined, 2))

  const metaphorContent = Buffer.from(issueData.body).toString('base64');
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
    const issueData = issue.data

    if (issueData.state === 'closed') {
      const labels = issueData.labels.map(label => label.name)

      // Metaphor Categories
      const isCssMetaphor = labels.every(label => ['metaphore', 'css'].includes(label))
      const isGoMetaphor = labels.every(label => ['metaphore', 'go'].includes(label))
      const isJavaScriptMetaphor = labels.every(label => ['metaphore', 'javascript'].includes(label))
      const isJavaMetaphor = labels.every(label => ['metaphore', 'java'].includes(label))
      const isMathsMetaphor = labels.every(label => ['metaphore', 'maths'].includes(label))
      const isPythonMetaphor = labels.every(label => ['metaphore', 'python'].includes(label))
      const isPhpMetaphor = labels.every(label => ['metaphore', 'php'].includes(label))
      const isPhysicsMetaphor = labels.every(label => ['metaphore', 'physics'].includes(label))
      const isRubyMetaphor = labels.every(label => ['metaphore', 'ruby'].includes(label))
      const isRustMetaphor = labels.every(label => ['metaphore', 'rust'].includes(label))
      const isZigMetaphor = labels.every(label => ['metaphore', 'zig'].includes(label))

      if (isCssMetaphor) {
        console.log(`Is css metaphor`)
        createMetaphorFile(client, issueData, context, 'css')
      } else if (isGoMetaphor) {
        console.log(`Is go metaphor`)
        createMetaphorFile(client, issueData, context, 'go')
      } else if (isJavaScriptMetaphor) {
        console.log(`Is javascript metaphor`)
        createMetaphorFile(client, issueData, context, 'javascript')
      } else if (isJavaMetaphor) {
        console.log(`Is java metaphor`)
        createMetaphorFile(client, issueData, context, 'java')
      } else if (isMathsMetaphor) {
        console.log(`Is maths metaphor`)
        createMetaphorFile(client, issueData, context, 'maths')
      } else if (isPythonMetaphor) {
        console.log(`Is python metaphor`)
        createMetaphorFile(client, issueData, context, 'python')
      } else if (isPhpMetaphor) {
        console.log(`Is php metaphor`)
        createMetaphorFile(client, issueData, context, 'php')
      } else if (isPhysicsMetaphor) {
        console.log(`Is physics metaphor`)
        createMetaphorFile(client, issueData, context, 'physics')
      } else if (isRubyMetaphor) {
        console.log(`Is ruby metaphor`)
        createMetaphorFile(client, issueData, context, 'ruby')
      } else if (isRustMetaphor) {
        console.log(`Is rust metaphor`)
        createMetaphorFile(client, issueData, context, 'rust')
      } else if (isZigMetaphor) {
        console.log(`Is zig metaphor`)
        createMetaphorFile(client, issueData, context, 'zig')
      }
    }
  } catch (error) {
    console.log(`Erorr on storyGenerator: ${error}`)
    return false
  }
}
