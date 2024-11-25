import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { UserPhoto } from '../interfaces/user-photo';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private photosSubject = new BehaviorSubject<UserPhoto[]>([]);
  photos$ = this.photosSubject.asObservable(); // Observable exposé

  private storageKey = 'photos';

  constructor() {}

  async init() {
    const storedPhotos = localStorage.getItem(this.storageKey);
    this.photosSubject.next(storedPhotos ? JSON.parse(storedPhotos) : []);
  }

  async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedImage = await this.savePicture(capturedPhoto);

    const currentPhotos = this.photosSubject.value;
    const updatedPhotos = [savedImage, ...currentPhotos];
    this.photosSubject.next(updatedPhotos);

    this.savePhotos(updatedPhotos);
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    if (!base64Data) throw new Error('Something went wrong');

    const fileName = `${Date.now()}.${photo.format}`;
    await Filesystem.writeFile({
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