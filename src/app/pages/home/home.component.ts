import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  enforceMuted(video: HTMLVideoElement): void {
    if (!video.muted) {
      video.muted = true;
    }

    if (video.defaultMuted !== true) {
      video.defaultMuted = true;
    }

    if (video.volume !== 0) {
      video.volume = 0;
    }
  }
}
