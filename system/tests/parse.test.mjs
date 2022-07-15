// import {jest} from '@jest/globals';
import { parse } from '../public/aesthetic.computer/lib/parse.mjs';

test('testing ~niki in parser', () => {
  expect(parse('~niki')).toEqual({
    path: "index",
    host: "niki.aesthetic.computer",
    params: [],
    search: "",
    hash: ""
  });
});