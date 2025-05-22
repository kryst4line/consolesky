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
  isElectron = false;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initApp();
  }

  initApp() {
    this.isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    this.authService.authenticationState.pipe(takeWhile(res => !res, true)).subscribe(state => {
      if (state) {
        this.router.navigate(['']);
      } else {
        this.router.navigate(['login']);
      }
    });
  }
}
