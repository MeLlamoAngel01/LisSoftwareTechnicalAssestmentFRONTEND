import { Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class Map implements AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @Output() markerAdded = new EventEmitter<{ position: google.maps.LatLngLiteral, title: string }>();

  private map!: google.maps.Map;
  private startMarker: google.maps.Marker | null = null;
  private endMarker: google.maps.Marker | null = null;
  startMarking: boolean = false;
  endMarking: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) { 
      await this.loadGoogleMaps();
      this.initMap();
    }
  }

  private loadGoogleMaps(): Promise<void> {
    if (typeof window !== 'undefined' && window.google?.maps) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('Google Maps failed to load');
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 31.71753522369196, lng: -106.39638445659507 },
      zoom: 12
    });

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng && (this.startMarking || this.endMarking)) {
        this.addMarker({
          position: event.latLng.toJSON(),
          title: this.startMarking ? 'Start' : 'End'
        });
      }
    });
  }

  addMarker(marker: { position: google.maps.LatLngLiteral, title: string }): void {
    if (marker.title === 'Start' && this.startMarker) {
      this.startMarker.setMap(null);
    } else if (marker.title === 'End' && this.endMarker) {
      this.endMarker.setMap(null);
    }

    const newMarker = new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });

    if (marker.title === 'Start') {
      this.startMarker = newMarker;
    } else {
      this.endMarker = newMarker;
    }

    this.markerAdded.emit(marker);
  }

  setMarkerMode(type: 'start' | 'end' | 'none'): void {
    this.startMarking = type === 'start';
    this.endMarking = type === 'end';
  }

  clearAllMarkers(): void {
    if (this.startMarker) {
      this.startMarker.setMap(null);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.endMarker.setMap(null);
      this.endMarker = null;
    }
  }
}