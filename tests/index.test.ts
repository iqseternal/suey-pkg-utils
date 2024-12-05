
import { StringFilters } from '../src';

test('asda', () => {

  expect(StringFilters.toValidStr('s', '-')).toEqual('s');
})
