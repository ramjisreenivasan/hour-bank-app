import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PlatformService } from './services/platform.service';
import { NavigationComponent } from './components/navigation/navigation.component';
import { MobileNavigationComponent } from './components/mobile/mobile-navigation.component';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule, 
    NavigationComponent, 
    MobileNavigationComponent,
    IonicModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'hOurBank - Skill Exchange Platform';

  constructor(
    private authService: AuthService,
    public platformService: PlatformService
  ) {}

  ngOnInit(): void {
    // Check initial auth status
    this.authService.checkAuthStatus();
  }
}
