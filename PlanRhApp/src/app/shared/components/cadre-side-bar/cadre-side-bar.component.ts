import { Component } from '@angular/core';
import {NavItem} from '../../../core/utils/interfaces/NavItem';
import {PrimeIcons} from 'primeng/api';
import {SideBarItemComponent} from '../side-bar-item/side-bar-item.component';

@Component({
  selector: 'app-cadre-side-bar',
  imports: [SideBarItemComponent],
  standalone : true,
  templateUrl: './cadre-side-bar.component.html',
  styleUrl: './cadre-side-bar.component.css'
})
export class CadreSideBarComponent {
  items: NavItem[] = [
    {title: 'Accueil', link: '/cadre', icon: PrimeIcons.HOME},
    {title: 'Personnel Paramédical', link: '/cadre/medical-staff', icon: PrimeIcons.CLIPBOARD},
    {title: 'Calendrier', link: '/cadre/calendar', icon: PrimeIcons.CALENDAR},
    {title: 'Absences', link: '/cadre/absence', icon: PrimeIcons.INFO_CIRCLE},
  ]
}
