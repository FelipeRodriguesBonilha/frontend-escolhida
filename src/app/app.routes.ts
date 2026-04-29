import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { 
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('./pages/login/login').then(m => m.Login) 
  },
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'vendas', loadComponent: () => import('./pages/sales/sales').then(m => m.Sales) },
      { 
        path: 'produtos', 
        children: [
          { path: '', loadComponent: () => import('./pages/products/products').then(m => m.Products) },
          { path: 'novo', loadComponent: () => import('./pages/products/products-form/products-form').then(m => m.ProductsForm) },
          { path: ':id/editar', loadComponent: () => import('./pages/products/products-form/products-form').then(m => m.ProductsForm) }
        ]
      },
      { path: 'relatorios', loadComponent: () => import('./pages/reports/reports').then(m => m.Reports) },
      { 
        path: 'categorias', 
        children: [
          { path: '', loadComponent: () => import('./pages/categories/categories').then(m => m.Categories) },
          { path: 'novo', loadComponent: () => import('./pages/categories/categories-form/categories-form').then(m => m.CategoriesForm) },
          { path: ':id/editar', loadComponent: () => import('./pages/categories/categories-form/categories-form').then(m => m.CategoriesForm) }
        ]
      },
      { 
        path: 'marcas', 
        children: [
          { path: '', loadComponent: () => import('./pages/brands/brands').then(m => m.Brands) },
          { path: 'novo', loadComponent: () => import('./pages/brands/brands-form/brands-form').then(m => m.BrandsForm) },
          { path: ':id/editar', loadComponent: () => import('./pages/brands/brands-form/brands-form').then(m => m.BrandsForm) }
        ]
      },
      { 
        path: 'fornecedores', 
        children: [
          { path: '', loadComponent: () => import('./pages/suppliers/suppliers').then(m => m.Suppliers) },
          { path: 'novo', loadComponent: () => import('./pages/suppliers/suppliers-form/suppliers-form').then(m => m.SuppliersForm) },
          { path: ':id/editar', loadComponent: () => import('./pages/suppliers/suppliers-form/suppliers-form').then(m => m.SuppliersForm) }
        ]
      },
      { path: 'estoque', loadComponent: () => import('./pages/stock/stock').then(m => m.Stock) },
      { path: 'caixa', loadComponent: () => import('./pages/cash-register/cash-register').then(m => m.CashRegisterComponent) },
      { 
        path: 'pagamentos', 
        children: [
          { path: '', loadComponent: () => import('./pages/payment-methods/payment-methods').then(m => m.PaymentMethods) },
          { path: 'novo', loadComponent: () => import('./pages/payment-methods/payment-methods-form/payment-methods-form').then(m => m.PaymentMethodsForm) },
          { path: ':id/editar', loadComponent: () => import('./pages/payment-methods/payment-methods-form/payment-methods-form').then(m => m.PaymentMethodsForm) }
        ]
      },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
