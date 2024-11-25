import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BehaviorSubject } from 'rxjs';
import { UserPhoto } from '../interfaces/user-photo';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private photosSubject = new BehaviorSubject<UserPhoto[]>([]);
  photos$ = this.photosSubject.asObservable();

  private storageKey = 'photos';

  constructor() {}

  async init() {
    const storedPhotos = localStorage.getItem(this.storageKey);
    const photos = storedPhotos ? JSON.parse(storedPhotos) : [];
    this.photosSubject.next(photos);
  }

  async addNewToGallery() {
    try {
      const capturedPhoto = await this.takePhoto();

      const savedImage = await this.savePicture(capturedPhoto);

      const currentPhotos = this.photosSubject.value;
      const updatedPhotos = [savedImage, ...currentPhotos];
      this.photosSubject.next(updatedPhotos);

      this.savePhotos(updatedPhotos);
    } catch (error) {
      console.error('Error while taking photo:', error);
    }
  }

  private async takePhoto(): Promise<Photo> {
    try {
      return await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      });
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Unable to access the camera.');
    }
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    let base64Data: string;
  
    // Lecture en base64
    try {
      base64Data = await this.readAsBase64(photo);
    } catch (error) {
      console.error('Erreur de lecture photo en base64:', error);
      throw new Error('Impossible de traiter la photo.');
    }
  
    const fileName = `${Date.now()}.${photo.format}`;
  
    // Vérifier si l'environnement est une application native ou le web
    if ((window as any).Capacitor.isNativePlatform()) {
      // Utilisation de Filesystem pour les applications mobiles
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });
  
      return {
        filepath: fileName,
        webviewPath: Capacitor.convertFileSrc(fileName), // Conversion pour les apps natives
      };
    } else {
      // Environnement web : Retourner directement les données en base64
      return {
        filepath: fileName,
        webviewPath: `data:image/${photo.format};base64,${base64Data}`,
      };
    }
  }  

  private async readAsBase64(photo: Photo): Promise<string> {
    try {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob);
    } catch (error) {
      console.error('Error reading photo as base64:', error);
      throw new Error('Failed to process photo.');
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private savePhotos(photos: UserPhoto[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(photos));
  }
}