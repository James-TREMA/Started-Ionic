import { PhotoService } from './../services/photo.service';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonIcon, IonFabButton, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, ExploreContainerComponent, IonImg]
})
export class Tab2Page {

  constructor(public photoService: PhotoService) {}

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