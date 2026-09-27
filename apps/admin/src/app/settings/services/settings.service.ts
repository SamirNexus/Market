import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  MerchantSettings,
  UpdateMerchantSettingsInput,
} from '@market/contracts/settings';
import { environment } from '../../../environments/environment';

export type {
  MerchantSettings,
  UpdateMerchantSettingsInput,
} from '@market/contracts/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly url = `${environment.apiBaseUrl}/admin/settings`;

  constructor(private http: HttpClient) {}

  get(): Observable<MerchantSettings> {
    return this.http.get<MerchantSettings>(this.url);
  }

  update(
    input: UpdateMerchantSettingsInput,
  ): Observable<MerchantSettings> {
    return this.http.patch<MerchantSettings>(this.url, input);
  }
}
