<div align="center">
  <p style="font-size: 3em; margin-bottom: 0px;">Taffy 🍬</p>
  <p style="font-style: italic;">AI Code Editor focused on multi file editing and better context</p>
![Placeholder gif demonstrating Taffy in action](#)
</div>


## Getting Started

1. Add to VSCode from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=FireJet.taffy)
2. Add either a OpenAI, Anthropic or DeepSeek API Key
3. Select any portion of your code, then press `Ctrl+Shift+M` to ask a question

## Motivation

We found that often with AI code assistants, they just don't seem smart enough to generate the correct code in the context required. Examples include

1. Not follow codebase best practices
2. Using outdated versions of libraries
3. Not understanding types within the codebase
4. Generation being limited to single file edits

The thing is, all of these are not outside the capabilities of modern LLMs - with the right information in the context window, all these issues can be resolved.

However, with alternative AI code assistants, they fall fall short in one of these ways:

1. Not having multi-file support
2. Not having sufficient context to answer the question correctly
3. Racking up large API bills because of large context windows

With our initial release, we've solved multi-file support, and with subsequent releases we hope to solve the other problems as well.

## Features
### Current Features

- Multi File Editing
- Fast edits (Only edit the section being updated)
- LLM Tools (LLM can read other files in your codebase, and make necessary updates)
- `@mentions` files in your codebase to reference them
- Bring Your Own key (BYOK)
- MIT Licensed

### Upcoming Features

Right now, we have a base of features that we believe make a good foundation for the developer experience that we expect from an AI code assistant. 

We have several ideas of how we can improve the developer experience, and we need your feedback and votes in order to better shape the development of this product.

- **Feature 1**: [Upvote this feature](#)
- **Feature 2**: [Upvote this feature](#)
- **Feature 3**: [Upvote this feature](#)

## Local Development

To run Taffy locally:

```sh
npm i          # Install dependencies
npm run serve  # Start the development server
```

Press `F5` to debug or run it in the standard VSCode extension host.

## License

MIT
