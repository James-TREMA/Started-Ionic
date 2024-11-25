import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage-angular';
import { UserPhoto } from '../interfaces/user-photo';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  photos: UserPhoto[] = [];
  private storageKey = 'photos';

  constructor(private storage: Storage) {}

  async init() {
    await this.storage.create(); // Initialise le stockage
    this.photos = (await this.storage.get(this.storageKey)) || []; // Charge les photos sauvegardées
  }

  async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedImage = await this.savePicture(capturedPhoto);

    this.photos.unshift(savedImage);
    await this.savePhotos(); // Sauvegarde des photos dans le stockage
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    if (!base64Data) throw new Error('Something went wrong');

    const fileName = `${Date.now()}.${photo.format}`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }

  private async readAsBase64(photo: Photo): Promise<string> {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob);
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Supprime les métadonnées
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async savePhotos() {
    await this.storage.set(this.storageKey, this.photos); // Sauvegarde des photos dans le stockage
  }
}