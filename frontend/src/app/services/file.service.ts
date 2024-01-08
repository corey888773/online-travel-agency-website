import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  baseUrl = 'http://localhost:8000/';

  constructor(private httpClient : HttpClient) { }

  public uploadImage(file: File) : Observable<string> {
    const uploadUrl = this.baseUrl + 'uploadImage';
    console.log(file);
    const formData = new FormData();
    const headers = { 'enctype': 'multipart/form-data' };
    formData.append('uploadFile', file);

    console.log(formData);

    return this.httpClient.post(uploadUrl, formData, {headers: headers}).pipe(
      map((response: any) => {
        const url: string = response.imgUrl;
        return url;
      }));
  }

  public getImagePath(imageName: string) : string {
    return this.baseUrl + imageName;
  }
}
