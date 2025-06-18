import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Map } from "./map/map";
import { GoogleMapsModule } from '@angular/google-maps';
import { TripsService } from '../hooks/services/trips.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Map, FormsModule, CommonModule, GoogleMapsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {
  @ViewChild(Map) map!: Map;

  constructor(private tripsService: TripsService, private cdRef: ChangeDetectorRef) { }

  title = 'LisSoftwarePruebaTecnicaFrontend';

  valueFilter: string = '';
  statusFilter = { value: 0, label: 'All' };
  statusOptions = [
    { value: 0, label: 'All' },
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' }
  ];

  isCardVisible = false;
  typeCard = 0;

  newTrip = {
    id: 0,
    tripConcept: '',
    idAssignedOperator: 0,
    scheduledStartDate: '',
    scheduledEndDate: '',
    // startTime: '',
    // endTime: '',
    startLat: 0.0,
    startLng: 0.0,
    endLat: 0.0,
    endLng: 0.0,
    startAddress: '',
    endAddress: '',
    status: 0,
    finished: false
  };

  tripsList: any[] = [];

  getTripsList(): void {
    this.tripsService.getTrips(
      this.valueFilter,
      this.statusFilter.value
    ).subscribe({
      next: (trips: any) => {
        const response = trips;
        this.tripsList = trips.data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error loading trips:', err)
    });

    this.cdRef.detectChanges();
  }

  openCard() {
    this.resetForm();
    this.typeCard = 0;
    this.isCardVisible = true;
  }

  openEditCard(data: any) {
    this.resetForm();
    this.typeCard = 1;
    this.isCardVisible = true;

    const editTrip = {
      id: data.id,
      tripConcept: data.tripConcept,
      idAssignedOperator: data.idAssignedOperator,
      scheduledStartDate: moment(data.scheduledStartDate).format('YYYY-MM-DD'),
      scheduledEndDate: moment(data.scheduledEndDate).format('YYYY-MM-DD'),
      startLat: data.startLat,
      startLng: data.startLng,
      endLat: data.endLat,
      endLng: data.endLng,
      startAddress: data.startAddress,
      endAddress: data.endAddress,
      status: data.status,
      finished: data.finished
    };

    this.map.addMarker({
      position: {
        lat: editTrip.startLat,
        lng: editTrip.startLng
      },
      title: "Start"
    });

    this.map.addMarker({
      position: {
        lat: editTrip.endLat,
        lng: editTrip.endLng
      },
      title: "End"
    });

    Object.assign(this.newTrip, editTrip);
  }

  closeCard() {
    this.resetForm();
    this.typeCard = 0;
    this.isCardVisible = false;
    this.map.clearAllMarkers();
  }

  addNewTrip(): void {
    if (!this.newTrip.tripConcept || !this.newTrip.startAddress || !this.newTrip.endAddress || !this.newTrip.scheduledStartDate || !this.newTrip.scheduledEndDate) {
      alert('Please fill required fields');
      return;
    }

    this.tripsService.addTrip(this.newTrip).subscribe({
      next: (response: any) => {
        this.closeCard();
        this.resetForm();
        this.getTripsList();
        alert('Trip added successfully');
      },
      error: (err) => console.error('Error adding trip:', err)
    });

    this.cdRef.detectChanges();
  }

  editTrip(): void {
    if (!this.newTrip.tripConcept || !this.newTrip.startAddress || !this.newTrip.endAddress || !this.newTrip.scheduledStartDate || !this.newTrip.scheduledEndDate) {
      alert('Please fill required fields');
      return;
    }

    this.tripsService.editTrip(this.newTrip).subscribe({
      next: (response: any) => {
        this.closeCard();
        this.resetForm();
        this.getTripsList();
        alert('Trip updated successfully');
      },
      error: (err) => console.error('Error adding trip:', err)
    });

    this.cdRef.detectChanges();
  }

  editTripStatus(status: number): void {
    this.tripsService.editTripStatus(this.newTrip, status).subscribe({
      next: (response: any) => {
        this.closeCard();
        this.resetForm();
        this.getTripsList();
        alert('Trip updated successfully');
      },
      error: (err) => console.error('Error adding trip:', err)
    });

    this.cdRef.detectChanges();
  }

  resetForm() {
    const defaultTrip = {
      id: 0,
      tripConcept: '',
      idAssignedOperator: 0,
      scheduledStartDate: '',
      scheduledEndDate: '',
      startLat: 0.0,
      startLng: 0.0,
      endLat: 0.0,
      endLng: 0.0,
      startAddress: '',
      endAddress: '',
      status: 0,
      finished: false
    };

    Object.assign(this.newTrip, defaultTrip);
  }

  tripStart = { position: { lat: 0, lng: 0 }, title: 'Start' };
  tripEnd = { position: { lat: 0, lng: 0 }, title: 'End' };
  tripMarkers = [
    this.tripStart,
    this.tripEnd
  ];

  currentMarkerMode: 'start' | 'end' | 'none' = 'none';

  setMarkerMode(type: 'start' | 'end') {
    this.currentMarkerMode = type;
    this.map.setMarkerMode(type);
  }

  onMarkerAdded(markerData: { position: google.maps.LatLngLiteral, title: string }) {
    if (markerData.title === 'Start') {
      this.tripStart.position = markerData.position;
      this.tripStart.title = 'Start';

      this.newTrip.startLat = markerData.position.lat;
      this.newTrip.startLng = markerData.position.lng;

      this.geocodePosition(markerData.position, 'start');
    } else if (markerData.title === 'End') {
      this.tripEnd.position = markerData.position;
      this.tripEnd.title = 'End';

      this.newTrip.endLat = markerData.position.lat;
      this.newTrip.endLng = markerData.position.lng;

      this.geocodePosition(markerData.position, 'end');
    }

    this.tripMarkers = [
      { ...this.tripStart },
      { ...this.tripEnd }
    ];

    this.currentMarkerMode = 'none';
    this.map.setMarkerMode('none');
    this.cdRef.detectChanges();
  }

  private geocodePosition(position: google.maps.LatLngLiteral, type: 'start' | 'end') {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        if (type === 'start') {
          this.newTrip.startAddress = results[0].formatted_address;
        } else {
          this.newTrip.endAddress = results[0].formatted_address;
        }

        this.cdRef.detectChanges();
      }
    });
  }
}
