import {Pipe, PipeTransform} from '@angular/core';
import {AuthService} from '@core/auth/auth.service';

@Pipe({
  name: 'isLoggedUser'
})
export class IsLoggedUserPipe implements PipeTransform {
  constructor(private authService: AuthService) {}
  transform(author: Partial<{did: string}>): boolean {
    return author.did == this.authService.loggedUser().did;
  }
}
