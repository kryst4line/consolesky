import {Injectable, signal} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {AppBskyActorDefs, AtpAgentLoginOpts} from "@atproto/api";
import {Router} from "@angular/router";
import {StorageKeys} from '@core/storage-keys';
import {agent} from '@core/bsky.api';
import {StorageService} from '@services/storage.service';
import {ColumnService} from '@services/column.service';
import {MessageService} from '@services/message.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authenticationState = new BehaviorSubject(false);
  loggedUser = signal<AppBskyActorDefs.ProfileViewDetailed>(undefined);

  constructor(
    private router: Router,
    private storageService: StorageService,
    private messageService: MessageService,
    private columnService: ColumnService
  ) {
    this.checkToken();
  }

  checkToken() {
    const sessionData = this.storageService.get(StorageKeys.TOKEN_KEY);
    if (sessionData) {
      agent.resumeSession(JSON.parse(sessionData)).then(
        () => {
          this.storageService.set(StorageKeys.TOKEN_KEY, JSON.stringify(agent.session));

          agent.getProfile({actor: agent.session.did}).then(response => {
            this.loggedUser.set(response.data);
            this.columnService.checkColumns();

            this.authenticationState.next(true);
          });
        }
      );
    }
  }

  login(credentials: AtpAgentLoginOpts) {
    from(agent.login(credentials)).subscribe({
      next: () => {
        this.storageService.set(StorageKeys.TOKEN_KEY, JSON.stringify(agent.session));

        from(agent.getProfile({
          actor: agent.session.did
        })).subscribe({
          next: response => {
            this.loggedUser.set(response.data);
            this.columnService.checkColumns();

            this.authenticationState.next(true);
            this.router.navigate(['']);
          }, error: err => this.messageService.error(err.message)
        });
      }, error: err => this.messageService.error(err.message)
    });
  }

  logout() {
    from(agent.logout()).subscribe({
      next: () => {
        this.storageService.remove(StorageKeys.TOKEN_KEY);
        this.authenticationState.next(false);
      }, error: err => this.messageService.error(err.message)
    });
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }
}
