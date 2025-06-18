import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_BASE_URL from './apiConfig';

@Injectable({ providedIn: 'root' })
export class TripsService {
    constructor(private http: HttpClient) { }

    addTrip(tripData: any) {
        return this.http.post(API_BASE_URL + '/Trips/InsertTrip', {
            "tripConcept": tripData.tripConcept,
            "idAssignedOperator": tripData.idAssignedOperator,
            "scheduledStartDate": tripData.scheduledStartDate,
            "scheduledEndDate": tripData.scheduledEndDate,
            // "startTime": tripData.startTime,
            // "endTime": tripData.endTime,
            "startLat": tripData.startLat,
            "startLng": tripData.startLng,
            "endLat": tripData.endLat,
            "endLng": tripData.endLng,
            "startAddress": tripData.startAddress,
            "endAddress": tripData.endAddress
        });
    }

    editTrip(tripData: any) {
        return this.http.put(API_BASE_URL + '/Trips/UpdateTrip', {
            "id": tripData.id,
            "tripConcept": tripData.tripConcept,
            "idAssignedOperator": tripData.idAssignedOperator,
            "scheduledStartDate": tripData.scheduledStartDate,
            "scheduledEndDate": tripData.scheduledEndDate,
            // "startTime": tripData.startTime,
            // "endTime": tripData.endTime,
            "startLat": tripData.startLat,
            "startLng": tripData.startLng,
            "endLat": tripData.endLat,
            "endLng": tripData.endLng,
            "startAddress": tripData.startAddress,
            "endAddress": tripData.endAddress
        });
    }

    editTripStatus(tripData: any, status: number) {
        return this.http.put(API_BASE_URL + '/Trips/UpdateTripStatus', {
            "id": tripData.id,
            "status": status,
        });
    }

    getTrips(value: string, status: number) {
        return this.http.get(API_BASE_URL + '/Trips/GetTrips', {
            params: {
                Value: value,
                Status: status
            }
        });
    }
}