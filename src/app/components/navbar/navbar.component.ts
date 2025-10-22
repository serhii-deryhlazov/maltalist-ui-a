import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Set up Google Sign-in callback
    (window as any).onGoogleSignIn = (response: any) => {
      this.authService.handleGoogleSignIn(response).subscribe({
        next: (user) => {
          if (user && user.id) {
            this.router.navigate(['/profile', user.id]);
          }
        },
        error: (err) => {
          console.error('Google login error:', err);
          alert('Google login failed.');
        }
      });
    };
  }
}
