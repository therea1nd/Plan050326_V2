import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 25rem; /* 400px */
    }
  `],
  template: `
    <div class="w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-800">เข้าสู่ระบบ KruPlan AI</h2>
        <p class="text-slate-500 mt-1">ยินดีต้อนรับกลับ!</p>
      </div>

      @if (errorMessage()) {
        <div class="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {{ errorMessage() }}
        </div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">อีเมล หรือ ชื่อผู้ใช้</label>
          <input type="text" formControlName="emailOrUsername" placeholder="กรอกอีเมล หรือ ชื่อผู้ใช้"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
          <input type="password" formControlName="password" placeholder="••••••••"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
        </div>
        
        <button type="submit" [disabled]="loginForm.invalid"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
          เข้าสู่ระบบ
        </button>
      </form>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t border-slate-200"></span>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="bg-white px-2 text-slate-400">หรือ</span>
        </div>
      </div>

      <button (click)="onGuestLogin()"
        class="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all flex justify-center items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-slate-500">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clip-rule="evenodd" />
        </svg>
        เข้าใช้งานแบบ Guest
      </button>

      <p class="text-center text-sm text-slate-600 mt-6">
        ยังไม่มีบัญชี? <button (click)="showRegister.emit()" class="font-semibold text-blue-600 hover:underline focus:outline-none">ลงทะเบียนที่นี่</button>
      </p>
    </div>
  `
})
export class LoginComponent {
  showRegister = output<void>();
  private authService = inject(AuthService);
  
  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    emailOrUsername: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onLogin() {
    if (this.loginForm.valid) {
      const { emailOrUsername, password } = this.loginForm.value;
      const result = this.authService.login(emailOrUsername!, password!);
      if (!result.success) {
        this.errorMessage.set(result.message);
      }
    }
  }

  onGuestLogin() {
    this.authService.loginAsGuest();
  }
}