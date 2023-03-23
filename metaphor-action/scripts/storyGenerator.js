const { Base64 } = require('js-base64');
const replace = require('replace-in-file');
const { promises: fsPromises } = require('fs');
const slugify = require('./utils/slugify');
const { ghBotUsername, ghBotEmail } = require('./utils/git');

/**
 * Creates a new metaphor file in the specified category, based on the provided issue data and context.
 * @async
 * @function createMetaphorFile
 * @param {Object} issueData - The issue data object containing information about the issue, including title, user, created date, and body content.
 * @param {Object} context - The context object containing information about the GitHub repository and issue, including owner, repo, and issue number.
 * @param {string} category - The category of the metaphor file to create.
 * @returns {Promise} A Promise that resolves when the metaphor file has been created in the GitHub repository.
 */
async function createMetaphorFile(issueData, context, category) {
  const templateFilePath = './templates/stories.txt';
  const metaphorTitle = slugify(issueData.title);

  const contentValues = [
    issueData.title,
    issueData.user.login,
    issueData.created_at,
    category,
    issueData.body,
  ];

  const replacementResult = await replaceTemplateFile(templateFilePath, contentValues);
  console.log('Replacement result: ' + JSON.stringify(replacementResult, undefined, 2))

  const markdownContent = await fsPromises.readFile(templateFilePath, 'utf-8');
  const metaphorContent = Base64.encode(markdownContent);

  const createContent = await createFileContent({
    owner: context.issue.owner,
    repo: context.issue.repo,
    path: `_stories/${category}/${metaphorTitle}.md`,
    message: `docs(generate): new metaphor from @${issueData.user.login}`,
    content: metaphorContent,
  });

  console.log(`Content Metadata: ${JSON.stringify(createContent, undefined, 2)}`);
}

/**
 * Replaces template file content with the specified values and returns the result.
 * @async
 * @function replaceTemplateFile
 * @param {string} filePath - The file path of the template file to replace.
 * @param {string[]} contentValues - An array of values to replace the template placeholders with.
 * @returns {Promise<string>} A Promise that resolves with the result of the template replacement operation.
 */
async function replaceTemplateFile(filePath, contentValues) {
  const replacementValues = ['{title}', '{author}', '{created_at}', '{language}', '{content}'];
  return await replace({
    files: filePath,
    from: replacementValues,
    to: contentValues,
  });
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
async function createFileContent({ owner, repo, path, message, content }) {
  const fileContent = Base64.decode(content);
  return await client.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: fileContent,
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
        createMetaphorFile(issueData, context, 'css')
      } else if (isGoMetaphor) {
        console.log(`Is go metaphor`)
        createMetaphorFile(issueData, context, 'go')
      } else if (isJavaScriptMetaphor) {
        console.log(`Is javascript metaphor`)
        createMetaphorFile(issueData, context, 'javascript')
      } else if (isJavaMetaphor) {
        console.log(`Is java metaphor`)
        createMetaphorFile(issueData, context, 'java')
      } else if (isMathsMetaphor) {
        console.log(`Is maths metaphor`)
        createMetaphorFile(issueData, context, 'maths')
      } else if (isPythonMetaphor) {
        console.log(`Is python metaphor`)
        createMetaphorFile(issueData, context, 'python')
      } else if (isPhpMetaphor) {
        console.log(`Is php metaphor`)
        createMetaphorFile(issueData, context, 'php')
      } else if (isPhysicsMetaphor) {
        console.log(`Is physics metaphor`)
        createMetaphorFile(issueData, context, 'physics')
      } else if (isRubyMetaphor) {
        console.log(`Is ruby metaphor`)
        createMetaphorFile(issueData, context, 'ruby')
      } else if (isRustMetaphor) {
        console.log(`Is rust metaphor`)
        createMetaphorFile(issueData, context, 'rust')
      } else if (isZigMetaphor) {
        console.log(`Is zig metaphor`)
        createMetaphorFile(issueData, context, 'zig')
      }
    }
  } catch (error) {
    console.log(`Erorr on storyGenerator: ${error}`)
    return false
  }
}
