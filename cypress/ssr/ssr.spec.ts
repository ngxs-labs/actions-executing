/// <reference types="cypress" />

describe('Server side rendering', () => {
  const indexUrl = '/';

  it('should contain paragraph', () => {
    cy.request(indexUrl)
      .its('body')
      .should('contain', 'Server-side rendered package is');
  });
});
