import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  
  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }
  
  isWeb(): boolean {
    return !Capacitor.isNativePlatform();
  }
  
  getPlatform(): string {
    return Capacitor.getPlatform();
  }
  
  isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }
  
  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }
}
