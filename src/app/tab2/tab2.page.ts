import { PhotoService } from './../services/photo.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

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
  constructor(public photoService: PhotoService) {}

  async ngOnInit() {
    // Initialisation pour charger les photos sauvegardées
    await this.photoService.init();
  }

  async addPhotoToGallery() {
    try {
      await this.photoService.addNewToGallery();
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  }

  trackByFn(index: number): number {
    return index;
  }
}
