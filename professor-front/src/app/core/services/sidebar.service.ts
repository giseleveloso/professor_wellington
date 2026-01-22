import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly STORAGE_KEY = 'sidebar_collapsed';

  collapsed = signal(this.loadState());

  toggle(): void {
    this.collapsed.update(v => !v);
    this.saveState();
  }

  collapse(): void {
    this.collapsed.set(true);
    this.saveState();
  }

  expand(): void {
    this.collapsed.set(false);
    this.saveState();
  }

  private loadState(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'true';
  }

  private saveState(): void {
    localStorage.setItem(this.STORAGE_KEY, String(this.collapsed()));
  }
}
