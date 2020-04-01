import * as p from 'prettier';

export const prettier = {
  format: (content: string) =>
    p.format(content, { singleQuote: true, parser: 'babel' })
};
