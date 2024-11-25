import { PhotoService } from './../services/photo.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { UserPhoto } from '../interfaces/user-photo';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCol, 
    IonRow, 
    IonGrid, 
    IonIcon, 
    IonFabButton, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonFab, 
    ExploreContainerComponent, 
    IonImg
  ]
})

export class Tab2Page implements OnInit {
  photos!: Observable<UserPhoto[]>;

  constructor(public photoService: PhotoService) {}

  ngOnInit() {
    this.photos = this.photoService.photos$; // Souscription à l'observable
    this.photoService.init(); // Initialisation du service
  }

  trackByFn(index: number, photo: UserPhoto) {
    return photo.filepath; // Clé unique pour le suivi
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
