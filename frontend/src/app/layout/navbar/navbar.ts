import { Component, EventEmitter, Output, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  @Output() toggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  isDark = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // Vérifier le thème sauvegardé ou utiliser la préférence système
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Utiliser la préférence système si disponible
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
      
      // Écouter les changements de préférence système
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  toggleTheme() {
    const nextTheme: ThemeMode = this.isDark ? 'light' : 'dark';
    this.setTheme(nextTheme);
    
    // Émettre un événement pour informer d'autres composants si nécessaire
    this.document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: nextTheme }
    }));
  }

  private setTheme(mode: ThemeMode) {
    this.isDark = mode === 'dark';
    
    // Sauvegarder la préférence
    localStorage.setItem('theme', mode);
    
    // Appliquer la classe sur l'élément html
    const htmlElement = this.document.documentElement;
    
    if (mode === 'dark') {
      this.renderer.addClass(htmlElement, 'dark');
    } else {
      this.renderer.removeClass(htmlElement, 'dark');
    }
    
    // Mettre à jour l'attribut pour l'accessibilité
    this.renderer.setAttribute(htmlElement, 'data-theme', mode);
    
    // Mettre à jour la meta theme-color pour mobile
    this.updateThemeColor(mode);
  }

  private updateThemeColor(theme: ThemeMode) {
    const themeColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = this.renderer.createElement('meta');
      this.renderer.setAttribute(metaThemeColor, 'name', 'theme-color');
      this.renderer.appendChild(this.document.head, metaThemeColor);
    }
    
    this.renderer.setAttribute(metaThemeColor, 'content', themeColor);
  }
}