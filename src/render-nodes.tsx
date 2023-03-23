import HTML from 'html-parse-stringify';
import { cloneElement, createElement, isValidElement } from 'react';

function mergeProps(source: any, target: any) {
  const newTarget = { ...target };
  // overwrite source.props when target.props already set
  newTarget.props = {...source.props, ...target.props};
  return newTarget;
}

function hasValidReactChildren(children: any) {
  if (Object.prototype.toString.call(children) !== '[object Array]') {
    return false;
  }
  return children.every((child: any) => isValidElement(child));
}

function hasChildren(node: any, checkLength?: boolean) {
  if (!node) { return false; }
  const base = node.props ? node.props.children : node.children;
  if (checkLength) { return base.length > 0; }
  return !!base;
}

function getChildren(node: any) {
  if (!node) { return []; }
  return node.props ? node.props.children : node.children;
}

function getAsArray(data: any) {
  return Array.isArray(data) ? data : [data];
}

export function renderNodes(children: any, targetString: string) {
  if (targetString === '') { return []; }

  // check if contains tags we need to replace from html string to react nodes
  const keepArray: any[] = [];
  const emptyChildrenButNeedsHandling =
    targetString && new RegExp(keepArray.join('|')).test(targetString);

  // no need to replace tags in the targetstring
  if (!children && !emptyChildrenButNeedsHandling) { return [targetString]; }

  // v2 -> interpolates upfront no need for "some <0>{{var}}</0>"" -> will be just "some {{var}}" in translation file
  const data = {};

  function getData(childs: any) {
    const childrenArray = getAsArray(childs);

    childrenArray.forEach(child => {
      if (typeof child === 'string') {
        return;
      }

      if (hasChildren(child)) {
        getData(getChildren(child));
      } else if (typeof child === 'object' && !isValidElement(child)) {
        Object.assign(data, child);
      }
    });
  }

  getData(children);

  // parse ast from string with additional wrapper tag
  // -> avoids issues in parser removing prepending text nodes
  const ast = HTML.parse(`<0>${targetString}</0>`);

  function renderInner(child: any, node: any, rootReactNode: any) {
    const childs = getChildren(child);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const mappedChildren = mapAST(childs, node.children, rootReactNode);
    // console.warn('INNER', node.name, node, child, childs, node.children, mappedChildren);
    return hasValidReactChildren(childs) && mappedChildren.length === 0
      ? childs
      : mappedChildren;
  }

  // reactNode (the jsx root element or child)
  // astNode (the translation string as html ast)
  // rootReactNode (the most outer jsx children array or trans components prop)
  function mapAST(reactNode: any, astNode: any, rootReactNode: any) {
    const reactNodes = getAsArray(reactNode);
    const astNodes = getAsArray(astNode);

    return astNodes.reduce((mem, node, i) => {
      const translationContent =
        node.children && node.children[0] && node.children[0].content;

      if (node.type === 'tag') {
        let tmp = reactNodes[parseInt(node.name, 10)]; // regular array (components or children)
        if (!tmp && rootReactNode.length === 1 && rootReactNode[0][node.name]) {
          tmp = rootReactNode[0][node.name];
        } // trans components is an object
        if (!tmp) { tmp = {}; }
        //  console.warn('TMP', node.name, parseInt(node.name, 10), tmp, reactNodes);
        const child =
          Object.keys(node.attrs).length !== 0
            ? mergeProps({ props: node.attrs }, tmp)
            : tmp;

        const isElement = isValidElement(child);

        const isValidTranslationWithChildren =
          isElement && hasChildren(node, true) && !node.voidElement;

        const isEmptyTransWithHTML =
          emptyChildrenButNeedsHandling &&
          typeof child === 'object' &&
          child.dummy &&
          !isElement;

        const isKnownComponent =
          typeof children === 'object' &&
          children !== null &&
          Object.hasOwnProperty.call(children, node.name);
        // console.warn('CHILD', node.name, node, isElement, child);

        if (
          hasChildren(child) || // the jsx element has children -> loop
          isValidTranslationWithChildren // valid jsx element with no children but the translation has -> loop
        ) {
          const inner = renderInner(child, node, rootReactNode);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          pushTranslatedJSX(child, inner, mem, i);
        } else if (isEmptyTransWithHTML) {
          // we have a empty Trans node (the dummy element) with a targetstring that contains html tags needing
          // conversion to react nodes
          // so we just need to map the inner stuff
          const inner = mapAST(
            reactNodes /* wrong but we need something */,
            node.children,
            rootReactNode
          );
          mem.push(cloneElement(child, { ...child.props, key: i }, inner));
        } else if (Number.isNaN(parseFloat(node.name))) {
          if (isKnownComponent) {
            const inner = renderInner(child, node, rootReactNode);
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            pushTranslatedJSX(child, inner, mem, i, node.voidElement);
          } else if (keepArray.indexOf(node.name) > -1) {
            if (node.voidElement) {
              mem.push(createElement(node.name, { key: `${node.name}-${i}` }));
            } else {
              const inner = mapAST(
                reactNodes /* wrong but we need something */,
                node.children,
                rootReactNode
              );

              mem.push(
                createElement(node.name, { key: `${node.name}-${i}` }, inner)
              );
            }
          } else if (node.voidElement) {
            mem.push(`<${node.name} />`);
          } else {
            const inner = mapAST(
              reactNodes /* wrong but we need something */,
              node.children,
              rootReactNode
            );

            mem.push(`<${node.name}>${inner}</${node.name}>`);
          }
        } else if (typeof child === 'object' && !isElement) {
          const content = node.children[0] ? translationContent : null;

          // v1
          // as interpolation was done already we just have a regular content node
          // in the translation AST while having an object in reactNodes
          // -> push the content no need to interpolate again
          if (content) { mem.push(content); }
        } else if (node.children.length === 1 && translationContent) {
          // If component does not have children, but translation - has
          // with this in component could be components={[<span class='make-beautiful'/>]} and in translation - 'some text <0>some highlighted message</0>'
          mem.push(
            cloneElement(child, { ...child.props, key: i }, translationContent)
          );
        } else {
          mem.push(cloneElement(child, { ...child.props, key: i }));
        }
      } else if (node.type === 'text') {
        mem.push(node.content);
      }
      return mem;
    }, []);
  }

  function pushTranslatedJSX(
    child: any,
    inner: any,
    mem: any,
    i: any,
    isVoid?: boolean
  ) {
    if (child.dummy) { child.children = inner; } // needed on preact!
    mem.push(
      cloneElement(
        child,
        { ...child.props, key: i },
        isVoid ? undefined : inner
      )
    );
  }

  // call mapAST with having react nodes nested into additional node like
  // we did for the string ast from translation
  // return the children of that extra node to get expected result
  const result = mapAST(
    [{ dummy: true, children: children || [] }],
    ast,
    getAsArray(children || [])
  );

  return getChildren(result[0]);
}
