// Simple client-side routing utilities
export interface Route {
  path: string;
  handler: () => void;
  requiresAuth?: boolean;
  allowedRoles?: ('client' | 'freelancer')[];
}

export class Router {
  private routes: Route[] = [];
  private currentPath: string = '';

  constructor() {
    // Listen for browser navigation events
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Handle initial page load
    this.handleRoute();
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  navigate(path: string, pushState: boolean = true): void {
    if (pushState) {
      window.history.pushState({}, '', path);
    }
    this.currentPath = path;
    this.handleRoute();
  }

  private handleRoute(): void {
    const path = window.location.pathname;
    this.currentPath = path;

    const route = this.findRoute(path);
    if (route) {
      // Check authentication and role requirements
      if (route.requiresAuth) {
        const { authManager } = require('./auth');
        
        if (!authManager.isAuthenticated()) {
          this.navigate('/login', false);
          return;
        }

        if (route.allowedRoles) {
          const user = authManager.getCurrentUser();
          if (!user || !route.allowedRoles.includes(user.role)) {
            this.navigate('/dashboard', false);
            return;
          }
        }
      }

      route.handler();
    } else {
      this.handle404();
    }
  }

  private findRoute(path: string): Route | null {
    return this.routes.find(route => {
      // Simple path matching (can be enhanced with parameters)
      return route.path === path || this.matchPath(route.path, path);
    }) || null;
  }

  private matchPath(routePath: string, actualPath: string): boolean {
    // Handle dynamic routes like /gig/:id
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) {
      return false;
    }

    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === actualParts[index];
    });
  }

  private handle404(): void {
    console.log('404 - Page not found:', this.currentPath);
    // You can implement a 404 page handler here
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getPathParams(routePath: string): Record<string, string> {
    const routeParts = routePath.split('/');
    const actualParts = this.currentPath.split('/');
    const params: Record<string, string> = {};

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = actualParts[index];
      }
    });

    return params;
  }
}

// URL building utilities
export const buildUrl = (path: string, params?: Record<string, string | number>): string => {
  let url = path;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value.toString());
    });
  }
  
  return url;
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

// Common route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GIGS: '/gigs',
  GIG_DETAILS: '/gig/:id',
  CREATE_GIG: '/create-gig',
  MY_GIGS: '/my-gigs',
  MY_BIDS: '/my-bids',
  PROFILE: '/profile',
} as const;

// Export singleton router instance
export const router = new Router();