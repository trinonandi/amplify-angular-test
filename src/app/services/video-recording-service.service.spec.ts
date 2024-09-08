import { TestBed } from '@angular/core/testing';

import { VideoRecordingServiceService } from './video-recording-service.service';

describe('VideoRecordingServiceService', () => {
  let service: VideoRecordingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoRecordingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
