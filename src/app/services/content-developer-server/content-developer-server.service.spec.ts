/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ContentDeveloperServerService } from './content-developer-server.service';

describe('ContentDeveloperServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentDeveloperServerService]
    });
  });

  it('should ...', inject([ContentDeveloperServerService], (service: ContentDeveloperServerService) => {
    expect(service).toBeTruthy();
  }));
});
