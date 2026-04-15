import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private router = inject(Router);
  private authService = inject(AuthService);

  isExpanded = true;
  isMobile = false;

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'point_of_sale', label: 'Vendas (PDV)', path: '/vendas' },
    { icon: 'category', label: 'Categorias', path: '/categorias' },
    { icon: 'branding_watermark', label: 'Marcas', path: '/marcas' },
    { icon: 'business', label: 'Fornecedores', path: '/fornecedores' },
    { icon: 'inventory_2', label: 'Produtos', path: '/produtos' },
    { icon: 'warehouse', label: 'Estoque', path: '/estoque' },
    { icon: 'payments', label: 'Pagamentos', path: '/pagamentos' },
    { icon: 'bar_chart', label: 'Relatórios', path: '/relatorios' },
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
