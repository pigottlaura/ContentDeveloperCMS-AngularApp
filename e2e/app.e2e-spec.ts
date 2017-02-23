import { ContentDeveloperCMSAngularAppPage } from './app.po';

describe('content-developer-cms-angular-app App', function() {
  let page: ContentDeveloperCMSAngularAppPage;

  beforeEach(() => {
    page = new ContentDeveloperCMSAngularAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
