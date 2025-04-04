import {Component} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {takeWhile} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initApp();
  }

  initApp() {
    this.authService.authenticationState.pipe(takeWhile(res => !res, true)).subscribe(state => {
      if (state) {
        this.router.navigate(['']);
      } else {
        this.router.navigate(['login']);
      }
    });
  }
}
