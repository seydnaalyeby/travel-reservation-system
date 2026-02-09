import { Component, EventEmitter, Output } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  @Output() toggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  isDark = false;

  ngOnInit() {
    const saved = (localStorage.getItem('theme') as ThemeMode | null) ?? 'light';
    this.setTheme(saved);
  }

  toggleTheme() {
    const next: ThemeMode = this.isDark ? 'light' : 'dark';
    this.setTheme(next);
  }

  private setTheme(mode: ThemeMode) {
    this.isDark = mode === 'dark';
    localStorage.setItem('theme', mode);

    // ✅ Dark mode général : on met une class sur <html>
    const root = document.documentElement;
    root.classList.toggle('dark', this.isDark);
  }
}
