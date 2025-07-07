import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'hOurBank - Skill Exchange Platform';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check initial auth status
    this.authService.checkAuthStatus();
  }
}
