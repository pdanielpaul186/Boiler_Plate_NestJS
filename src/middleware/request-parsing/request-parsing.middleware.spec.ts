import { RequestParsingMiddleware } from './request-parsing.middleware';

describe('RequestParsingMiddleware', () => {
  it('should be defined', () => {
    expect(new RequestParsingMiddleware()).toBeDefined();
  });
});
