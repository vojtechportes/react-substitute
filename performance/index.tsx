import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Renderer, PartialProps, usePartials } from '../src/index';

interface ItemProps {
  url: string;
  items?: ItemProps[];
}

interface ContextProps {
  test: string;
  items: ItemProps[];
  index?: number;
}

const partials: PartialProps[] = [
  {
    name: 'list',
    content: `
      {{#each items}} {{! Each item is an "li" }}
        <li>
            {{url}}
            {{#if items}} {{! Within the context of the current item }}
            <ul>
            {{> list}} {{! Recursively render the partial }}
            </ul>
            {{/if}}
        </li>
      {{/each}}
      `,
  },
];

const source = `
<div>
  {{test}} / {{index}}
</div>
<ul>
  {{> list}}
</ul>`;

const context: ContextProps = {
  test: 'My Test',
  items: [{ url: '/a', items: [{ url: '/a/b' }] }, { url: '/c' }],
};

const App = () => {
  const [iterations, setIterations] = React.useState(1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  usePartials(partials);

  const handleApply = React.useCallback(() => {
    if (inputRef.current) {
      setIterations(Number(inputRef.current.value));
    }
  }, []);

  const renderTimes = Array(iterations).fill(undefined);

  return React.useMemo(
    () => (
      <div>
        <input type="number" defaultValue={iterations} ref={inputRef} />
        <button onClick={handleApply}>Apply</button>

        {renderTimes.map((_, index) => (
          <div key={index}>
            <Renderer<ContextProps> source={source} context={context} />
          </div>
        ))}
      </div>
    ),
    [source, context, renderTimes, iterations]
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
