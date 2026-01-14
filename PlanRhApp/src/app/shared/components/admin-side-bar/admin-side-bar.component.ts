import { Component } from '@angular/core';
import { NavItem } from '../../../core/utils/interfaces/NavItem';
import { PrimeIcons } from 'primeng/api';
import { SideBarItemComponent } from '../side-bar-item/side-bar-item.component';

@Component({
  selector: 'app-admin-side-bar',
  standalone: true,
  imports: [SideBarItemComponent],
  templateUrl: './admin-side-bar.component.html',
  styleUrls: ['./admin-side-bar.component.css'],
})
export class AdminSideBarComponent {
  aItems: NavItem[] = [
    { title: 'Accueil', link: '/admin', icon: PrimeIcons.HOME },
    { title: 'Utilisateurs', link: '/admin/users', icon: PrimeIcons.USER },
    { title: 'Configuration', link: '/admin/configuration', icon: PrimeIcons.COG },
    //{ title: 'Horaires', link: '/admin/hours', icon: PrimeIcons.CLOCK },
  ];
}