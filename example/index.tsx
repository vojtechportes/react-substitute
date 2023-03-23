import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Link } from './Link';
import { substitute } from '../src/substitute';

export default function App() {
  const text =
    'Lorem ipsum dolor sit amet {user|123, John Doe}, {user|456, Jane Doe}';

  const substitutedText = substitute(text, {
    transform: (value, _placeholder, key, _modifier, context) => {
      if (key === 'user') {
        const [userId, userName] = context;

        return `<0 to="/users/${userId}">${userName}</0>`;
      }

      return value;
    },
    context: {
      user: '',
    },
    contextSeparator: '|',
    modifierSeparator: ':',
    contextType: 'list',
    components: [<Link />],
    returnReactElement: true,
  });

  return (
    <div className="App">
      {substitutedText}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
