import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
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
        <h2 class="text-2xl font-bold text-slate-800">สร้างบัญชีใหม่</h2>
        <p class="text-slate-500 mt-1">เริ่มต้นใช้งาน KruPlan AI</p>
      </div>

      @if (errorMessage()) {
        <div class="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {{ errorMessage() }}
        </div>
      }

      <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
          <input type="text" formControlName="username" placeholder="ตั้งชื่อผู้ใช้"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
        </div>
         <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
          <input type="email" formControlName="email" placeholder="กรอกอีเมล"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
          <input type="password" formControlName="password" placeholder="••••••••"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
          <input type="password" formControlName="confirmPassword" placeholder="••••••••"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
           @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <p class="text-xs text-red-500 mt-1">รหัสผ่านไม่ตรงกัน</p>
            }
        </div>
        
        <button type="submit" [disabled]="registerForm.invalid"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
          ลงทะเบียน
        </button>
      </form>

      <p class="text-center text-sm text-slate-600 mt-6">
        มีบัญชีอยู่แล้ว? <button (click)="showLogin.emit()" class="font-semibold text-blue-600 hover:underline focus:outline-none">เข้าสู่ระบบที่นี่</button>
      </p>
    </div>
  `
})
export class RegisterComponent {
  showLogin = output<void>();
  private authService = inject(AuthService);
  
  errorMessage = signal<string | null>(null);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  onRegister() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      const result = this.authService.register({ username: username!, email: email!, password: password! });
      if (result.success) {
        alert(result.message);
        this.showLogin.emit();
      } else {
        this.errorMessage.set(result.message);
      }
    }
  }
}
