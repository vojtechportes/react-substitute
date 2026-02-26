# React Substitute

<p align="center">
<a href="https://badge.fury.io/js/@vojtechportes%2Freact-substitute"><img src="https://badge.fury.io/js/@vojtechportes%2Freact-substitute.svg" alt="npm version" height="18"></a>
</p>

Highly configurable placeholder substitution for React: replace
`{placeholders}` in a string using values from a context object **or**
render the result as **React nodes** (with component placeholders like
`<0>...</0>`).

---

## Features

- Replace `{placeholders}` using a context object (supports **nested
  objects** via dot-path keys)
- Optional `transform()` hook for custom replacement logic
- Supports **modifiers** and a single **item-level context** inside
  placeholders
- Can return either a **string** or **React nodes**
- Customizable placeholder separators and RegExp pattern

---

## Install

```bash
npm i @vojtechportes/react-substitute
# or
yarn add @vojtechportes/react-substitute
```

Node: \>= 10

---

## Quick start (string output)

```ts
import { reactSubstitute } from '@vojtechportes/react-substitute';

const text = 'Hello {user.name}! You have {count} messages.';

const out = reactSubstitute(text, {
  context: {
    user: { name: 'John' },
    count: 3,
  },
});

console.log(out);
// "Hello John! You have 3 messages."
```

Nested objects are flattened internally, so `{user.name}` works out of
the box.

Unmatched placeholders are replaced with an empty string by default.

---

## Placeholder syntax

Default format:

- `{key}`
- `{key|modifier1|modifier2:context}`

Defaults: - `modifierSeparator`: `|` - `contextSeparator`: `:` -
`pattern`: `/\{([^{}]+)\}/g`

### Modifiers

Everything after `|` is collected into `modifiers: string[]` and passed
to `transform()`.

### Item-level context

Only **one** context segment is supported (after `:`). If more are
present, only the first is used.

`contextType` options:

- `'normal'` → string (default)
- `'list'` → comma-separated list → `string[]`
- `'object'` → JSON parsed object

---

## API

### `reactSubstitute(str, options)`

```ts
import { reactSubstitute } from '@vojtechportes/react-substitute';

const result = reactSubstitute('...', options);
```

Return type:

- `string` (default)
- `React.ReactNode` when `returnReactElement: true`

---

## Options

- `pattern?: RegExp`
- `modifierSeparator?: string`
- `contextSeparator?: string`
- `context?: unknown`
- `forceReplace?: boolean`
- `transform?: (value, placeholder, key, modifiers?, context?) => string | number`
- `contextType?: 'list' | 'normal' | 'object'`
- `returnReactElement?: boolean`
- `components?: any[]`

---

## Example: React output with transform

```tsx
import React, { PropsWithChildren } from 'react';
import { reactSubstitute } from '@vojtechportes/react-substitute';

type LinkProps = PropsWithChildren<{ to: string }>;
const Link: React.FC<LinkProps> = ({ to, children }) => (
  <a href={to}>{children}</a>
);

const text = 'Users: {user:123, John Doe}, {user:456, Jane Doe}';

const nodes = reactSubstitute(text, {
  contextType: 'list',
  context: { user: '' },

  transform: (_value, _placeholder, key, _modifiers, itemContext) => {
    if (key === 'user') {
      const [id, name] = itemContext as string[];
      return `<0 to="/users/${id}">${name}</0>`;
    }
    return '';
  },

  components: [<Link to="" />],
  returnReactElement: true,
});
```

Your `transform()` can output numeric tags like `<0>...</0>`. These are
replaced by the corresponding element from `components[]`.

---

## Development

```bash
yarn start
yarn build
yarn checkAll
```

---

## License

MIT
