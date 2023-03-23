import { flatten } from 'flat';
import React from 'react';
import { renderNodes } from './render-nodes';

export interface SubstituteOptionsProps {
  pattern?: RegExp;
  modifierSeparator?: string;
  contextSeparator?: string;
  context?: unknown;
  transform?: (
    value: string | number,
    placeholder: string,
    key: string,
    modifiers?: string[],
    context?: any
  ) => string | number;
  contextType?: 'list' | 'normal' | 'object';
  returnReactElement?: boolean;
  components?: any[];
}

/**
 * Function that will replace placeholders in string. Default placeholder format is {placeholder}
 * and can be changed in options by changing patter property. Placeholders can also contain
 * modifiers and local context, that can be handeled in transform function. Format of a modifier in placeholder is
 * {placeholder|modifier:context}. Modifier and context separators can be changed in options by changing modifierSeparator
 * property. If placeholder value is not matched with any key in context object, empty string is
 * returned.
 *
 * @param str
 * @param options
 */
export const substitute = (
  str: string,
  options: SubstituteOptionsProps
): string | React.ReactNode => {
  let {
    pattern,
    modifierSeparator,
    contextSeparator,
    context,
    contextType,
    returnReactElement,
    components,
  } = options;
  const { transform } = options;

  if (!pattern) {
    pattern = new RegExp(/\{([^{}]+)\}/g);
  }

  if (!modifierSeparator) {
    modifierSeparator = '|';
  }

  if (!contextSeparator) {
    contextSeparator = ':';
  }

  if (!context) {
    context = {};
  }

  if (!contextType) {
    contextType = 'normal';
  }

  if (!returnReactElement) {
    returnReactElement = false;
  }

  if (!components) {
    components = [];
  }

  const flatContext = flatten(context) as { [key: string]: string | number };

  const separatorsRegexp = new RegExp(
    `(\\${modifierSeparator}|\\${contextSeparator})`
  );

  const response = str
    .replace(pattern, placeholder => {
      const [key, ...rest] = placeholder.slice(1, -1).split(separatorsRegexp);
      const value = flatContext[key];

      const results: { modifiers: string[]; contexts: string[] } = {
        modifiers: [],
        contexts: [],
      };

      rest.forEach((item, index) => {
        const isNextItemPushable =
          rest[index + 1] !== contextSeparator &&
          rest[index + 1] !== modifierSeparator &&
          rest[index + 1];

        if (item === contextSeparator) {
          if (isNextItemPushable) {
            results.contexts.push(rest[index + 1]);
          }
        }

        if (item === modifierSeparator) {
          if (isNextItemPushable) {
            results.modifiers.push(rest[index + 1]);
          }
        }
      });

      if (results.contexts.length > 1) {
        console.warn(
          'Only one item level context is allowed. Only first context will be used'
        );
      }

      const modifiers = results.modifiers;
      const itemContext = results.contexts[0];

      if (transform) {
        let parsedContext: any;

        if (itemContext) {
          if (contextType === 'list') {
            parsedContext = itemContext
              .split(',')
              .reduce<string[]>((acc, current) => {
                acc.push(current.trim());

                return acc;
              }, []);
          } else if (contextType === 'object') {
            parsedContext = JSON.parse(itemContext);
          } else {
            parsedContext = itemContext;
          }
        } else {
          if (contextType === 'list') {
            parsedContext = [];
          } else if (contextType === 'object') {
            parsedContext = {};
          } else {
            parsedContext = undefined;
          }
        }

        return String(
          transform(value, placeholder, key, modifiers, parsedContext)
        );
      }

      if (value) {
        return String(value);
      }

      return '';
    })
    /**
     * Replace multiple spaces with one space in case
     * placeholders are replaced with empty value.
     */
    .replace(/  +/g, ' ')
    /**
     * Trim remaining spaces from the beginning and the end.
     */
    .trim()
    /**
     * Remove last additional spaces before punctuation
     */
    .replace(/(\s)([!?."',])/g, '$2');

  if (returnReactElement) {
    return renderNodes(components, response);
  }

  return response;
};
