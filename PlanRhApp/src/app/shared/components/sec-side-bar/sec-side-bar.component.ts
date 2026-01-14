import { Component } from '@angular/core';
import {NavItem} from '../../../core/utils/interfaces/NavItem';
import {PrimeIcons} from 'primeng/api';
import {SideBarItemComponent} from '../side-bar-item/side-bar-item.component';

@Component({
  selector: 'app-sec-side-bar',
  imports: [SideBarItemComponent],
  standalone : true,
  templateUrl: './sec-side-bar.component.html',
  styleUrl: './sec-side-bar.component.css'
})
export class SecSideBarComponent {
  items: NavItem[] = [
    {title: 'Accueil', link: '/sec', icon: PrimeIcons.HOME},
    {title: 'Personnel Paramédical', link: '/sec/medical-staff', icon: PrimeIcons.BARS},
    {title: 'Calendrier', link: '/sec/calendar', icon: PrimeIcons.CALENDAR},
    {title: 'Signaler', link: '/sec/report-absence', icon: PrimeIcons.INFO_CIRCLE},
    {title: 'Mes demandes', link: '/sec/asks', icon: PrimeIcons.CLIPBOARD},
  ]
}
